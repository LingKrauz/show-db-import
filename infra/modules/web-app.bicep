@description('Web App name.')
param name string

@description('Azure region for the Web App.')
param location string

@description('App Service plan resource ID.')
param serverFarmId string

@description('Frontend URL allowed by CORS.')
param frontendUrl string

@description('Deployment environment name (e.g. dev, test, prod).')
param environmentName string

@description('ASP.NET Core environment name passed via ASPNETCORE_ENVIRONMENT.')
param aspNetCoreEnvironment string = environmentName == 'dev' ? 'Development' : environmentName == 'prod' ? 'Production' : environmentName

@description('Runtime stack for the Web App.')
param runtimeStack string = 'DOTNETCORE|10.0'

@description('Application Insights connection string. Leave empty to skip telemetry wiring.')
param appInsightsConnectionString string = ''

@description('Additional app settings to merge into the site config.')
param additionalAppSettings object = {}

@description('Tags to apply to the Web App.')
param tags object = {}

var baseAppSettings = [
  {
    name: 'ASPNETCORE_ENVIRONMENT'
    value: aspNetCoreEnvironment
  }
  {
    name: 'FrontendUrl'
    value: frontendUrl
  }
]

var telemetryAppSettings = empty(appInsightsConnectionString) ? [] : [
  {
    name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
    value: appInsightsConnectionString
  }
]

var customAppSettings = [
  for item in items(additionalAppSettings): {
    name: item.key
    value: string(item.value)
  }
]

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: name
  location: location
  kind: 'app,linux'
  tags: tags
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    httpsOnly: true
    serverFarmId: serverFarmId
    siteConfig: {
      alwaysOn: true
      appSettings: concat(baseAppSettings, telemetryAppSettings, customAppSettings)
      ftpsState: 'Disabled'
      http20Enabled: true
      linuxFxVersion: runtimeStack
      minTlsVersion: '1.2'
    }
  }
}

output name string = webApp.name
output id string = webApp.id
output defaultHostname string = webApp.properties.defaultHostName
output principalId string = webApp.identity.principalId
output url string = 'https://${webApp.properties.defaultHostName}'
