const axios = require('axios');
const { notion } = require('./config/Notion');

const AGENCIES_DB = process.env.NOTION_AGENCIES_DB;
const FAQ_DB = process.env.NOTION_FAQ_DB;
const FS_DB = process.env.NOTION_FS_DB;


const currency = async() => {
    const endpoint = 'https://open.er-api.com/v6/latest/USD';
    const { data } = await axios.get(endpoint);
    const nzd = data['rates']['NZD'];
    const resp =  `
    Cotizacion Dolar Americano a Dolar Kiwi
    1 USD = ${nzd.toFixed(2)} NZD
  
    Conversion Dolar Kiwi a Dolar Americano
    1 NZD = ${(1/nzd).toFixed(2)} USD
    `
    return resp;
}


const GetAgencies = async({filterByCity, filterByAgency} = {}) => {
    const query = { database_id: AGENCIES_DB };

    if (filterByCity) {
        query.filter = {
            property: 'City',
            select: {
                equals: filterByCity
            }
        };
    }
    
    const { results } = await notion.databases.query(query);

    let agencies = results.map(ag => {
        return {
            id: ag.properties.ID.unique_id.number,
            name: ag.properties.Agency.title[0].plain_text,
            telephone: ag.properties.Telephone.phone_number,
            address: ag.properties.Address.rich_text[0]?.plain_text,
            website: ag.properties.Website.url,
            city: ag.properties.City.select.name,
            latitude: ag.properties.loc_lat.rich_text[0]?.plain_text,
            longitude: ag.properties.loc_lng.rich_text[0]?.plain_text
        }
    }).sort((a,b) => a.id - b.id)

    if(filterByAgency){
        agencies = agencies.filter(r => r.id == filterByAgency);
    }

    return agencies;
}

const GetFaq = async() => {
    const query = { database_id: FAQ_DB };
    
    const { results } = await notion.databases.query(query);

    const faq = results.map(f => {
        return {
            pregunta: f.properties.Pregunta.title[0].plain_text,
            respuesta: f.properties.Respuesta.rich_text[0]?.plain_text,
            question: f.properties.Question.rich_text[0]?.plain_text,
            answer: f.properties.Answer.rich_text[0]?.plain_text
        }
    });

    return faq;
}

const GetFS = async() => {
    const query = { database_id: FS_DB };
    
    const { results } = await notion.databases.query(query);

    const fs = results.map(f => {
        return {
            step: f.properties.Paso.title[0].plain_text,
            description: f.properties.Descripcion.rich_text[0]?.plain_text,
            recommendation: f.properties.Recomendacion.rich_text[0]?.plain_text,
            order: f.properties.Orden.number,
        }
    }).sort((a,b) => a.order - b.order);

    return fs;
}



module.exports = {
    currency,
    GetAgencies,
    GetFaq,
    GetFS
}