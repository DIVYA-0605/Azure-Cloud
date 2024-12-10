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
    const workItemResponse = await axiosInstance.get(
      `/wit/workitems/${id}?fields=System.Id,System.Title,System.State,System.AssignedTo,System.CreatedBy,System.CreatedDate&api-version=7.1`
    );

    return {
      statusCode: 200,
      body: JSON.stringify(workItemResponse.data),
    };
  } catch (error) {
    console.error('Error fetching work item:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch work item.' }),
    };
  }
};
