targetScope = 'resourceGroup'

@description('Workload name used in resource naming.')
param workloadName string = 'show-db-import'

@description('Deployment environment name such as dev, test, or prod.')
param environmentName string = 'dev'

@description('Azure region for the deployment.')
param location string = resourceGroup().location

@description('Short Azure region code used in naming, such as eus2.')
param regionShort string = 'eus2'

@description('Instance token used in resource names.')
param instance string = '001'

@description('Static Web App SKU.')
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSku string = 'Free'

@description('App Service plan SKU name for the backend.')
param appServicePlanSkuName string = 'B1'

@description('App Service plan SKU tier for the backend.')
param appServicePlanSkuTier string = 'Basic'

@description('Runtime stack for the backend web app.')
param backendRuntimeStack string = 'DOTNETCORE|10.0'

@description('Enable baseline monitoring resources.')
param enableMonitoring bool = true

@description('Optional tags to apply to all resources.')
param tags object = {}

var workloadToken = toLower(replace(replace(workloadName, '-', ''), '_', ''))
var environmentToken = toLower(environmentName)
var regionToken = toLower(regionShort)
var uniqueSuffix = take(uniqueString(subscription().subscriptionId, resourceGroup().id, workloadToken, environmentToken), 6)

var commonTags = union(tags, {
  environment: environmentName
  managedBy: 'bicep'
  repository: workloadName
  workload: workloadName
})
var resourceGroupPortalUrl = 'https://portal.azure.com/#resource${resourceGroup().id}'
var appServicePlanPortalUrl = 'https://portal.azure.com/#resource${appServicePlan.outputs.id}'
var backendWebAppPortalUrl = 'https://portal.azure.com/#resource${webApp.outputs.id}'
var staticWebAppPortalUrl = 'https://portal.azure.com/#resource${staticWebApp.outputs.id}'
var deploymentResourceId = resourceId('Microsoft.Resources/deployments', deployment().name)
var deploymentPortalUrl = 'https://portal.azure.com/#resource${deploymentResourceId}'

var staticWebAppName = 'swa-${workloadToken}-${environmentToken}-${instance}-${uniqueSuffix}'
var appServicePlanName = 'plan-${workloadToken}-${environmentToken}-${regionToken}-${instance}'
var backendWebAppName = 'app-${workloadToken}-api-${environmentToken}-${instance}-${uniqueSuffix}'
var applicationInsightsName = 'appi-${workloadToken}-${environmentToken}'
var logAnalyticsWorkspaceName = 'log-${workloadToken}-${environmentToken}-${regionToken}'

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'static-web-app'
  params: {
    location: location
    name: staticWebAppName
    sku: staticWebAppSku
    tags: union(commonTags, {
      component: 'frontend'
      host: 'static-web-app'
      service: 'web'
    })
  }
}

module appServicePlan 'modules/app-service-plan.bicep' = {
  name: 'backend-plan'
  params: {
    capacity: 1
    location: location
    name: appServicePlanName
    skuName: appServicePlanSkuName
    skuTier: appServicePlanSkuTier
    tags: union(commonTags, {
      component: 'api'
      host: 'app-service-plan'
      service: 'backend'
    })
  }
}

module monitoring 'modules/monitoring.bicep' = if (enableMonitoring) {
  name: 'monitoring'
  params: {
    applicationInsightsName: applicationInsightsName
    location: location
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
    tags: union(commonTags, {
      component: 'monitoring'
      service: 'observability'
    })
  }
}

module webApp 'modules/web-app.bicep' = {
  name: 'backend-web-app'
  params: {
    additionalAppSettings: {}
    appInsightsConnectionString: monitoring.?outputs.connectionString ?? ''
    environmentName: environmentName
    frontendUrl: staticWebApp.outputs.url
    location: location
    name: backendWebAppName
    runtimeStack: backendRuntimeStack
    serverFarmId: appServicePlan.outputs.id
    tags: union(commonTags, {
      component: 'api'
      host: 'app-service'
      service: 'backend'
    })
  }
}

output resourceGroupName string = resourceGroup().name

output staticWebAppName string = staticWebApp.outputs.name
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname
output staticWebAppUrl string = staticWebApp.outputs.url

output backendAppServicePlanName string = appServicePlan.outputs.name
output backendWebAppName string = webApp.outputs.name
output backendDefaultHostname string = webApp.outputs.defaultHostname
output backendApiBaseUrl string = webApp.outputs.url

output applicationInsightsName string = monitoring.?outputs.applicationInsightsName ?? ''
output resourceGroupPortalUrl string = resourceGroupPortalUrl
output appServicePlanPortalUrl string = appServicePlanPortalUrl
output backendWebAppPortalUrl string = backendWebAppPortalUrl
output staticWebAppPortalUrl string = staticWebAppPortalUrl
output deploymentName string = deployment().name
output deploymentPortalUrl string = deploymentPortalUrl

output resourceIds object = {
  appServicePlan: appServicePlan.outputs.id
  applicationInsights: monitoring.?outputs.applicationInsightsId ?? ''
  backendWebApp: webApp.outputs.id
  logAnalyticsWorkspace: monitoring.?outputs.logAnalyticsWorkspaceId ?? ''
  staticWebApp: staticWebApp.outputs.id
}

output deploymentSummary object = {
  backend: {
    apiBaseUrl: webApp.outputs.url
    appServicePlanName: appServicePlan.outputs.name
    hostname: webApp.outputs.defaultHostname
    portalUrl: backendWebAppPortalUrl
    webAppName: webApp.outputs.name
  }
  deployment: {
    name: deployment().name
    portalUrl: deploymentPortalUrl
  }
  monitoring: enableMonitoring ? {
    applicationInsightsName: monitoring.?outputs.applicationInsightsName ?? ''
    logAnalyticsWorkspaceName: monitoring.?outputs.logAnalyticsWorkspaceName ?? ''
  } : {
    applicationInsightsName: ''
    logAnalyticsWorkspaceName: ''
  }
  portalLinks: {
    appServicePlan: appServicePlanPortalUrl
    backendWebApp: backendWebAppPortalUrl
    resourceGroup: resourceGroupPortalUrl
    staticWebApp: staticWebAppPortalUrl
  }
  resourceGroupName: resourceGroup().name
  resourceIds: {
    appServicePlan: appServicePlan.outputs.id
    applicationInsights: monitoring.?outputs.applicationInsightsId ?? ''
    backendWebApp: webApp.outputs.id
    logAnalyticsWorkspace: monitoring.?outputs.logAnalyticsWorkspaceId ?? ''
    staticWebApp: staticWebApp.outputs.id
  }
  staticWebApp: {
    hostname: staticWebApp.outputs.defaultHostname
    name: staticWebApp.outputs.name
    portalUrl: staticWebAppPortalUrl
    url: staticWebApp.outputs.url
  }
}
