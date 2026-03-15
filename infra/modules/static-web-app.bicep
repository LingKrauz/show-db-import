@description('Static Web App name.')
param name string

@description('Azure region for the Static Web App.')
param location string

@description('Static Web App SKU.')
@allowed([
  'Free'
  'Standard'
])
param sku string

@description('Tags to apply to the Static Web App.')
param tags object = {}

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  sku: {
    name: sku
    tier: sku
  }
  tags: tags
  properties: {}
}

output name string = staticWebApp.name
output id string = staticWebApp.id
output defaultHostname string = staticWebApp.properties.defaultHostname
output url string = 'https://${staticWebApp.properties.defaultHostname}'
