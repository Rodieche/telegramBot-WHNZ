const axios = require('axios');

const base_url = 'https://api.immigration.govt.nz/ea-datashare/v1/search';
const headers = {
    'ocp-apim-subscription-key': process.env.IMMIGRATION_ACCREDITED_EMPLOYER_KEY
}

const checkAccreditedEmployer = async (employer = '') => {
    if (!employer || employer == '') return;

    const endpoint = `${base_url}/${employer}`

    const { data } = await axios.get(endpoint, { headers });
    const { items } = data;
    let strEmployers = '';

    if(!items) return;
    console.log(items);

    items.forEach(function(e){
        strEmployers += `Accredited Employer: <b>${e.employerName}</b> found - NZBZ: ${e.nzbn} - Trading Name: ${e.tradingName} \n\n`;
    });

    return strEmployers;
}

module.exports = {
    checkAccreditedEmployer
}