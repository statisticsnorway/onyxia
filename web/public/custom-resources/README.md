# Custom resources directory

## enforce-dataAdmins-reason
Enforce that reason is given if a data-admin group/role is selected in our bucket mounting. 
The launch-button will be disabled as long no reason is given. This will enhance user experience, as they no longer will get an ambiguous error message if the reason is not given.  

## ssb-plugin

Adds a price estimator (very rough and static estimate) to the GUI based on requested CPU and memory. The prices are based on running in Google Kubernetes Engine.


## Build
In this directory you can drop the custom resources for your instance.  
To use them in production, create a Zip file with the content of 
this directory and use the `CUSTOM_RESOURCES` environnement
variable. See `.env` file for more infos.

ZIP can be created with this snippet:
```shell
# cd to this directory
zip custom-resources-yyyymmdd.zip dapla_lang.svg team_add.svg ssb_logo.svg custom.css ssb_logo_lang.svg ssb_and_dapla_logo.svg ssb-plugin.js enforce-dataAdmins-reason.js <other_files_one_want_in_the_zip>
```