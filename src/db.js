const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => new Date(Date.now() - 86400000).toISOString().split('T')[0];

async function getOrCreateUser(lineUserId, displayName) {
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single();

  if (!user) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({ line_user_id: lineUserId, display_name: displayName })
      .select()
      .single();
    user = newUser;

    await supabase.from('user_stats').insert({ user_id: user.id });
  }

  return user;
}

async function getAllUsers() {
  const { data } = await supabase.from('users').select('id, line_user_id, display_name');
  return data || [];
}

async function getTodayStatus(userId) {
  const { data } = await supabase
    .from('daily_status')
    .select('*')
    .eq('user_id', userId)
    .eq('status_date', today())
    .single();
  return data;
}

async function setTodayStatus(userId, status) {
  const existing = await getTodayStatus(userId);
  if (existing) {
    await supabase
      .from('daily_status')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('daily_status')
      .insert({ user_id: userId, status_date: today(), status });
  }
}

async function getUserStats(userId) {
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data || { total_checkins: 0, current_streak: 0, max_streak: 0, break_count: 0 };
}

async function doCheckin(userId) {
  const todayDate = today();

  const { data: existing } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', todayDate)
    .single();

  if (existing) return { alreadyCheckedIn: true, streak: existing.streak_count };

  const { data: yesterdayCheckin } = await supabase
    .from('checkins')
    .select('streak_count')
    .eq('user_id', userId)
    .eq('checkin_date', yesterday())
    .single();

  const newStreak = yesterdayCheckin ? yesterdayCheckin.streak_count + 1 : 1;

  await supabase
    .from('checkins')
    .insert({ user_id: userId, checkin_date: todayDate, streak_count: newStreak });

  const stats = await getUserStats(userId);
  const newMax = Math.max(stats.max_streak || 0, newStreak);

  await supabase
    .from('user_stats')
    .update({
      total_checkins: (stats.total_checkins || 0) + 1,
      current_streak: newStreak,
      max_streak: newMax,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return { alreadyCheckedIn: false, streak: newStreak };
}

async function doBreak(userId) {
  const todayStatus = await getTodayStatus(userId);

  if (todayStatus?.status === 'break') {
    return { alreadyBroke: true };
  }

  const stats = await getUserStats(userId);

  // 如果今天已打卡成功，移除 checkin 並扣回 total_checkins
  const { data: todayCheckin } = await supabase
    .from('checkins')
    .select('id')
    .eq('user_id', userId)
    .eq('checkin_date', today())
    .single();

  const updatePayload = {
    current_streak: 0,
    break_count: (stats.break_count || 0) + 1,
    updated_at: new Date().toISOString(),
  };

  if (todayCheckin) {
    await supabase.from('checkins').delete().eq('id', todayCheckin.id);
    updatePayload.total_checkins = Math.max(0, (stats.total_checkins || 0) - 1);
  }

  await supabase.from('user_stats').update(updatePayload).eq('user_id', userId);
  await setTodayStatus(userId, 'break');

  return { alreadyBroke: false };
}

async function getTodayDraw(userId) {
  const { data } = await supabase
    .from('draws')
    .select('*')
    .eq('user_id', userId)
    .eq('draw_date', today())
    .single();
  return data;
}

async function saveDraw(userId, cardId) {
  await supabase.from('draws').insert({ user_id: userId, card_id: cardId, draw_date: today() });
}

// 新增卡片到蒐集，回傳是否為新卡
async function collectCard(userId, cardId) {
  const { data: existing } = await supabase
    .from('user_cards')
    .select('id')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .single();

  if (existing) return { isNew: false };

  await supabase.from('user_cards').insert({ user_id: userId, card_id: cardId });
  return { isNew: true };
}

// 取得唯一蒐集卡片數
async function getCollectedCardCount(userId) {
  const { count } = await supabase
    .from('user_cards')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count || 0;
}

module.exports = {
  getOrCreateUser,
  getAllUsers,
  getTodayStatus,
  setTodayStatus,
  getUserStats,
  doCheckin,
  doBreak,
  getTodayDraw,
  saveDraw,
  collectCard,
  getCollectedCardCount,
};
