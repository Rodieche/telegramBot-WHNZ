const axios = require('axios');

const base_url = 'https://api.immigration.govt.nz/ea-datashare/v1/search';
const headers = {
    'ocp-apim-subscription-key': process.env.IMMIGRATION_ACCREDITED_EMPLOYER_KEY
}

const checkAccreditedEmployer = async (employer = '') => {
    if (!employer || employer == '' || employer.length < 3) return 'You must entry more than 3 letters to searcht';

    const endpoint = `${base_url}/${employer}`

    try{
        const { data } = await axios.get(endpoint, { headers });
        const { items } = data;
        let strEmployers = '';

        if(!items) return;
        // console.log(items);

        items.forEach(function(e){
            strEmployers += `Accredited Employer: <b>${e.employerName}</b> found - NZBZ: ${e.nzbn} - Trading Name: ${e.tradingName} \n\n`;
        });

        return strEmployers;
    }catch(e){
        console.log(e);
    }
}

module.exports = {
    checkAccreditedEmployer
}