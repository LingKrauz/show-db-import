@description('Application Insights resource name.')
param applicationInsightsName string

@description('Log Analytics workspace name.')
param logAnalyticsWorkspaceName string

@description('Azure region for monitoring resources.')
param location string

@description('Tags to apply to monitoring resources.')
param tags object = {}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    retentionInDays: 30
    sku: {
      name: 'PerGB2018'
    }
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

output applicationInsightsName string = applicationInsights.name
output applicationInsightsId string = applicationInsights.id
output connectionString string = applicationInsights.properties.ConnectionString
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id
