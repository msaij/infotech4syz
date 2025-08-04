variable "default_location" {
  description = "The default location for resources"
  type        = string
  default     = "central india"
}

#  variables for delivery challan tags
variable "tags_dc_tracker" {
  description = "Tags for the Delivery Challan Tracker resources"
  type        = map(string)
  default     = {
    environment = "Production"
    project     = "Delivery Challan Tracker"
  }
}

# resource group name
variable "rgname_dc_tracker" {
  description = "The name of the resource group for the Delivery Challan Tracker"
  type        = string
  default     = "rg-dc-tracker"  
}

# variables for storage account
# storage account name
variable "storagename_dc_tracker" {
  description = "value for storage account name for the Delivery Challan Tracker"
  type        = string
  default     = "storagedctracker"  
}
# storage account container name
variable "containername_dc_tracker_pod" {
  description = "Name of the storage container for the Delivery Challan Tracker"
  type        = string
  default     = "dc-tracker-pod"
}