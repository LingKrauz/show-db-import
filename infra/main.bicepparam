using './main.bicep'

param workloadName = 'show-db-import'
param environmentName = 'dev'
param location = 'eastus2'
param regionShort = 'eus2'
param instance = '001'

param staticWebAppSku = 'Free'

param appServicePlanSkuName = 'B1'
param appServicePlanSkuTier = 'Basic'

param backendRuntimeStack = 'DOTNETCORE|10.0'
param enableMonitoring = true

param tags = {
  owner: 'show-db-import'
  project: 'show-db-import'
}
