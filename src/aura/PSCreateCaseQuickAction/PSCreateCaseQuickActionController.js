({
    doInit : function(component, event, helper) {
        var device = $A.get("$Browser.formFactor");
        console.log("formFactor=" + device);
        
        component.set("v.caseId", null);
        component.set("v.contactId", null);
        
        //////////////////////////////////////
        // get the current lat/lng location //
        //////////////////////////////////////
        navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
            component.set("v.latitude", location.coords.latitude);
            component.set("v.longitude", location.coords.longitude);
            
            var target = component.find("locateDiv");
            $A.util.removeClass(target, 'hide');
            
            if (device == 'DESKTOPXX')
            {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success!",
                    "message": "GPS location obtained!",
                    "duration": 500,
                    "type": "info"
                });
                toastEvent.fire();
            }
            
        }));
        
        helper.getStatus(component);
    },
    submitCase : function(component, event, helper) {
        helper.saveCaseAndAttachFile(component);
    },
    cancel : function(component, event, helper){
        $A.get("e.force:closeQuickAction").fire();
    }
})