const axios = require('axios');

const { AZURE_DEVOPS_PAT, AZURE_DEVOPS_ORG, AZURE_DEVOPS_PROJECT } = process.env;

const axiosInstance = axios.create({
  baseURL: `https://dev.azure.com/${AZURE_DEVOPS_ORG}/${AZURE_DEVOPS_PROJECT}/_apis`,
  headers: {
    Authorization: `Basic ${Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64')}`,
  },
});

exports.handler = async (event) => {
  const { id } = event.queryStringParameters;

  try {
    const initialResponse = await axiosInstance.get(
      `/wit/workitems/${id}?fields=System.Id,System.Title,System.State&api-version=7.1`
    );

    const selfLink = initialResponse.data._links.self.href;

    const selfResponse = await axios.get(selfLink, {
      headers: {
        Authorization: `Basic ${Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64')}`,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify(selfResponse.data),
    };
  } catch (error) {
    console.error('Error fetching data from self link:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch data from self link.' }),
    };
  }
};
