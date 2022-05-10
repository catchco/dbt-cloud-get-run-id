const axios = require('axios');
const core = require('@actions/core');
const github = require('@actions/github');

const DBT_CLOUD_ACCOUNT_ID = core.getInput('dbt_cloud_account_id');
const DBT_CLOUD_API_KEY = core.getInput('dbt_cloud_api_key');
const DBT_CLOUD_JOB_ID = core.getInput('dbt_cloud_job_id');
const DBT_CLOUD_API_REQUEST_LIMIT = core.getInput('dbt_cloud_request_limit');

const GITHUB_PR_NUMBER = github.context.issue.number;

const dbt_cloud_api = axios.create({
  baseURL: 'https://cloud.getdbt.com/api/v2/',
  timeout: 10000,
  headers: {
    'Authorization': `Token ${DBT_CLOUD_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

const filterRuns = (jobRuns) => {
  const foundRun = jobRuns.find(run => {
    if(run.trigger.github_pull_request_id !== undefined) {
      return run.trigger.github_pull_request_id === GITHUB_PR_NUMBER
    }
  });

  return foundRun;
}

const getJobRuns = async (offset) => {
  const url =
    `accounts/${DBT_CLOUD_ACCOUNT_ID}/runs` +
    `?job_definition_id=${DBT_CLOUD_JOB_ID}` +
    '&include_related=["trigger"]' +
    '&order_by=-started_at' +
    `&offset=${offset}` +
    `&limit=${DBT_CLOUD_API_REQUEST_LIMIT}`;

    const response = await dbt_cloud_api.get(url);
    return response.data;
}

const getRunId = async () => {
  let hasMoreRecords = true;
  let offset = 0;
  let runObj = undefined;

  while(hasMoreRecords) {
    const jobRuns = await getJobRuns(offset);

    offset += jobRuns.extra.pagination.count;
    if (offset === jobRuns.extra.pagination.total_count){
      hasMoreRecords = false
    };

    runObj = filterRuns(jobRuns.data);
    if (runObj !== undefined) return runObj.id;
  }
  core.setFailed(`Unable to find a dbt Cloud run associated with Pull Request #${GITHUB_PR_NUMBER}`);
}

const executeAction = async () => {
  try{
    core.info(`Looking for a run associated with JobId: ${DBT_CLOUD_JOB_ID} and Pull Request #${GITHUB_PR_NUMBER}`);
    const runId = await getRunId();
    core.setOutput('runId', runId);
  }
  catch(exception){
    core.setFailed(exception);
  }
}

executeAction();