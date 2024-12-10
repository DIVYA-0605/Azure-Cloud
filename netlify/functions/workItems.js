const axios = require('axios');

const { AZURE_DEVOPS_PAT, AZURE_DEVOPS_ORG, AZURE_DEVOPS_PROJECT } = process.env;

const axiosInstance = axios.create({
  baseURL: `https://dev.azure.com/${AZURE_DEVOPS_ORG}/${AZURE_DEVOPS_PROJECT}/_apis`,
  headers: {
    Authorization: `Basic ${Buffer.from(`:${AZURE_DEVOPS_PAT}`).toString('base64')}`,
  },
});

exports.handler = async (event) => {
  const { searchTerm = '', page = 1, perPage = 50 } = event.queryStringParameters;

  try {
    const wiqlQuery = {
      query: `SELECT [System.Id], [System.Title], [System.State] FROM WorkItems WHERE [System.Title] CONTAINS '${searchTerm}' ORDER BY [System.CreatedDate] DESC`,
    };

    const queryResponse = await axiosInstance.post('/wit/wiql?api-version=7.1', wiqlQuery);
    const workItemIds = queryResponse.data.workItems
      .slice((page - 1) * perPage, page * perPage)
      .map((item) => item.id);

    if (workItemIds.length > 0) {
      const workItemsResponse = await axiosInstance.get(
        `/wit/workitems?ids=${workItemIds.join(',')}&fields=System.Id,System.Title,System.State,System.AssignedTo,System.CreatedBy,System.CreatedDate&api-version=7.1`
      );
      return {
        statusCode: 200,
        body: JSON.stringify(workItemsResponse.data.value),
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }
  } catch (error) {
    console.error('Error fetching work items:', error.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch work items.' }),
    };
  }
};
