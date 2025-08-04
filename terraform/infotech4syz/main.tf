# Create a resource group
resource "azurerm_resource_group" "rg_dc_tracker" {
    name     = var.rgname_dc_tracker
    location = var.default_location
    tags = var.tags_dc_tracker
}

resource "azurerm_storage_account" "storage_dc_tracker"{
    name = var.storagename_dc_tracker
    location = var.default_location
    resource_group_name = azurerm_resource_group.rg_dc_tracker.name
    account_tier = "Standard"
    account_replication_type = "LRS"
    access_tier = "Hot"

    tags = var.tags_dc_tracker
    depends_on = [ azurerm_resource_group.rg_dc_tracker ]
}

resource "azurerm_storage_container" "container_dc_tracker_pod" {
    name = var.containername_dc_tracker_pod
    storage_account_id = azurerm_storage_account.storage_dc_tracker.id
    container_access_type = "private"

    depends_on = [ azurerm_storage_account.storage_dc_tracker ]
}