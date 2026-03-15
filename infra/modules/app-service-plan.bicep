@description('App Service plan name.')
param name string

@description('Azure region for the App Service plan.')
param location string

@description('SKU name for the App Service plan.')
param skuName string

@description('SKU tier for the App Service plan.')
param skuTier string

@description('Instance capacity for the App Service plan.')
param capacity int = 1

@description('Tags to apply to the App Service plan.')
param tags object = {}

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: name
  location: location
  kind: 'linux'
  sku: {
    capacity: capacity
    name: skuName
    tier: skuTier
  }
  tags: tags
  properties: {
    reserved: true
  }
}

output name string = appServicePlan.name
output id string = appServicePlan.id
