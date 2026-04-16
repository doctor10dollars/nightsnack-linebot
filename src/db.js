const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 取得或建立用戶
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
  }

  return user;
}

// 今天有沒有打過卡
async function getTodayCheckin(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .single();
  return data;
}

// 執行打卡，計算streak
async function doCheckin(userId) {
  const today = new Date().toISOString().split('T')[0];
  
  // 昨天有沒有打卡（計算streak用）
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const { data: yesterdayCheckin } = await supabase
    .from('checkins')
    .select('streak_count')
    .eq('user_id', userId)
    .eq('checkin_date', yesterday)
    .single();

  const newStreak = yesterdayCheckin ? yesterdayCheckin.streak_count + 1 : 1;

  const { data } = await supabase
    .from('checkins')
    .insert({ user_id: userId, checkin_date: today, streak_count: newStreak })
    .select()
    .single();

  return data;
}

// 取得用戶統計資料
async function getUserStats(userId) {
  const { data: checkins } = await supabase
    .from('checkins')
    .select('checkin_date, streak_count')
    .eq('user_id', userId)
    .order('checkin_date', { ascending: false });

  if (!checkins || checkins.length === 0) {
    return { totalCheckins: 0, currentStreak: 0, maxStreak: 0, hasTodayCheckin: false };
  }

  const today = new Date().toISOString().split('T')[0];
  const hasTodayCheckin = checkins[0]?.checkin_date === today;
  const currentStreak = hasTodayCheckin ? checkins[0].streak_count : 0;
  const maxStreak = Math.max(...checkins.map(c => c.streak_count));

  return {
    totalCheckins: checkins.length,
    currentStreak,
    maxStreak,
    hasTodayCheckin
  };
}

// 今天有沒有抽過卡
async function getTodayDraw(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('draws')
    .select('*')
    .eq('user_id', userId)
    .eq('draw_date', today)
    .single();
  return data;
}

// 記錄抽卡
async function saveDraw(userId, cardId) {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('draws')
    .insert({ user_id: userId, card_id: cardId, draw_date: today });
}

module.exports = {
  getOrCreateUser,
  getTodayCheckin,
  doCheckin,
  getUserStats,
  getTodayDraw,
  saveDraw
};
