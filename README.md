## dbt Cloud Get Run Id

This action finds the most recent dbt Cloud run id that was triggered by the given GitHub pull request.

### Inputs
  **Required**:
  - `dbt_cloud_account_id` - dbt Cloud Account Id
  - `dbt_cloud_api_key` - dbt Cloud API Key
  - `dbt_cloud_job_id` - dbt Cloud Job Id

  **Optional**:
  - `dbt_cloud_request_limit` - Record limit while listing runs. [Default=`"100"`]

### Example usage
```yaml
- uses: catchco/dbt-cloud-get-run-id@latest
  id: dbt_cloud_get_run_id
  with:
      dbt_cloud_account_id: ${{ secrets.DBT_ACCOUNT_ID }}
      dbt_cloud_api_key: ${{ secrets.DBT_CLOUD_API_KEY }}
      dbt_cloud_job_id: ${{ secrets.DBT_JOB_ID }}
      dbt_cloud_request_limit: 1000
```