function qr(...labels) {
  return {
    type: 'text',
    quickReply: {
      items: labels.map(label => ({
        type: 'action',
        action: { type: 'message', label, text: label },
      })),
    },
  };
}

function textMsg(text, ...qrLabels) {
  const msg = { type: 'text', text };
  if (qrLabels.length > 0) {
    msg.quickReply = {
      items: qrLabels.map(label => ({
        type: 'action',
        action: { type: 'message', label, text: label },
      })),
    };
  }
  return msg;
}

function imageMsg(url) {
  return {
    type: 'image',
    originalContentUrl: url,
    previewImageUrl: url,
  };
}

async function reply(client, replyToken, messages) {
  if (!Array.isArray(messages)) messages = [messages];
  await client.replyMessage({ replyToken, messages });
}

async function push(client, userId, messages) {
  if (!Array.isArray(messages)) messages = [messages];
  await client.pushMessage({ to: userId, messages });
}

module.exports = { reply, push, textMsg, imageMsg, qr };
