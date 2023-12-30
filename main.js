require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const helpers = require('./helpers');
const thelpers = require('./telegram_helpers');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const MAX_MESSAGE_LENGTH = 4000;

const commandList = `/recruitments - Lista de reclutadoras
    
/exchange - Valor del cambio del dolar Estadounidense

/firststeps - Primeros pasos al llegar como WH

/faq - Preguntas frecuentes

/about - Aceca del bot WHNZ

/help - Lista de comandos`

// Manejar comandos
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const greetMessage = `¡Kia ora! Bienvenido a la aplicación de Nueva Zelanda diseñada para ayudar a los entusiastas de las working holidays a obtener información inicial crucial sobre Nueva Zelanda. Estamos aquí para proporcionarte conocimientos valiosos y recursos que mejorarán tu experiencia durante tu working holiday. Siéntete libre de explorar y descubrir todo lo que necesitas saber sobre vivir, trabajar y disfrutar tu tiempo en Nueva Zelanda. Si tienes alguna pregunta, no dudes en preguntar. ¡Feliz exploración!
    
    Para comenzar podes explorar nuestras lista de comandos:

    ${commandList}
    `
    bot.sendMessage(chatId, greetMessage);
});

bot.onText(/\/exchange/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const resp = await helpers.currency();
    
    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        // Si es un grupo, intentamos obtener el ID del mensaje original
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }
    
    bot.sendMessage(chatId, resp, options);
});

bot.onText(/\/recruitments/, async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const chatType = msg.chat.type;
    const channel = msg.reply_to_message?.forum_topic_created?.name;
    let resp = null;

    let text = '';
    if(!channel){
        resp = await helpers.GetAgencies();
    }else{
        resp = await helpers.GetAgencies({ filterByCity: channel });
    }

    resp.forEach(function(a){
        const recruit = `
${a['id']}: <b>${a['name']}</b>`;
        text += recruit;
    });


    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        // Si es un grupo, intentamos obtener el ID del mensaje original
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }

    if(text){
        text += `

Para ver una agencia en especifica usa el comando /agency 1 (o el numero de agencia que desees obtener informacion)
        `
    }else{
        text = `No hay reclutadoras incluidas en la lista de ${channel}`;
    }

    bot.sendMessage(chatId, text, options);
});

bot.onText(/agency\s(\d+)/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;

    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        // Si es un grupo, intentamos obtener el ID del mensaje original
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }

    const channel = msg.reply_to_message?.forum_topic_created?.name;
    const agency = msg.text.split(' ')[1];
    let recruit = 'Seleccione una agencia de la lista. Para volver a ver la lista use el comando /recruitments';
    let resp = await helpers.GetAgencies({ filterByCity: channel, filterByAgency: agency });
    if (resp.length > 0){
        resp = resp[0];
        recruit = `
${resp['id']}: <b>${resp['name']}</b>
City: ${resp['city']}
Telephone: ${resp['telephone']}
Address: ${resp['address']}
Website: ${resp['website']}
        `;
        bot.sendMessage(chatId,recruit,options);
        if(resp.latitude && resp.longitude){
            bot.sendLocation(chatId,resp.latitude,resp.longitude,options);
        }
    }else{
        bot.sendMessage(chatId,recruit,options);
    }
});

bot.onText(/\/faq/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const userLanguage = thelpers.getUserLanguage(msg.from.language_code);

    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }
    const resp = await helpers.GetFaq();

    if(userLanguage == 'spanish'){
        resp.forEach(function(f){
            const faq = `
<b>${f['pregunta']}</b>
<i>${f['respuesta']}</i>
    `;
    bot.sendMessage(chatId, faq, options);
        });
    }else{
        resp.forEach(function(f){
            const faq = `
<b>${f['question']}</b>
<i>${f['answer']}</i>
    `;
            bot.sendMessage(chatId, faq, options);
        });
    }
});

bot.onText(/\/firststeps/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    let text = '';

    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }
    const resp = await helpers.GetFS();

    resp.forEach(function(f){
        const fs = `
<b>${f['order']}. ${f['step']}</b>
${f['description']}
${(f['recommendation']? '✨ Recomendacion: <i>' + f['recommendation'] + '</i>': null)}
    `;
        text += fs;
    });

    bot.sendMessage(chatId, text, options);
});

bot.onText(/\/about/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    let text = 'Este bot fue desarrollado por Central Node para ayudar a Latinos en NZ. Por cualquier duda o consulta pueden escribirnos a nuesto <a href="https://www.linkedin.com/in/rechenique">Linkedin</a>';

    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        // Si es un grupo, intentamos obtener el ID del mensaje original
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }

    bot.sendMessage(chatId, text, options);
});

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;

    const options = {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
    };

    if (chatType === 'group' || chatType === 'supergroup') {
        // Si es un grupo, intentamos obtener el ID del mensaje original
        const replyToMessageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (replyToMessageId) {
            options.reply_to_message_id = replyToMessageId;
        }
    }

    bot.sendMessage(chatId, commandList, options);
});