({
    MAX_FILE_SIZE: 750000, 
    
    saveCaseAndAttachFile : function(component) {
        var self = this;
        var map = {};
        
        self.showSpinner(component);
        
        map['contactId'] = component.get('v.contactId');
        map['status'] = component.get('v.status');
        map['subject'] = component.get('v.subject');
        map['description'] = component.get('v.description');
        map['latitudeField'] = component.get('v.latitudeField');
        map['longitudeField'] = component.get('v.longitudeField');
        map['latitude'] = component.get('v.latitude');
        map['longitude'] = component.get('v.longitude');
        
        // save the case
        var action = component.get("c.saveCase");
        action.setParams({
            "params": JSON.stringify(map)
        });
        
        var self = this;
        action.setCallback(this, function(actionResult) {
            var resp = JSON.parse(actionResult.getReturnValue());
            
            if (resp.status == 'SUCCESS') {
                component.set('v.caseId', resp.data);
                self.saveFile(component);
            } else {
                self.hideSpinner(component);
                
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Warning!",
                    "message": resp.msg,
                    //"duration": 2000,
                    "type": "warning",
                    mode: "sticky"
                });
                toastEvent.fire();
            }
            
        });
        $A.enqueueAction(action);
        
        
    },
    getStatus : function(component) {
        var action = component.get("c.getStatusOptions");
        
        var self = this;
        action.setCallback(this, function(actionResult) {
            component.set("v.statusList", actionResult.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    
    saveFile : function(component) {
        var fileInput = component.find("file").getElement();
        var file = fileInput.files[0];
        var self = this;
        
        if (file != undefined)
        {
            if (file.size > this.MAX_FILE_SIZE) {
                alert('File size cannot exceed ' + this.MAX_FILE_SIZE + ' bytes.\n' +
                      'Selected file size: ' + file.size);
                return;
            }
            
            var fr = new FileReader();
            
            fr.onload = function() {
                var fileContents = fr.result;
                var base64Mark = 'base64,';
                var dataStart = fileContents.indexOf(base64Mark) + base64Mark.length;
                
                fileContents = fileContents.substring(dataStart);
                
                self.uploadFile(component, file, fileContents);
            };
            
            fr.readAsDataURL(file);
        }
        else
        {
            self.hideSpinner(component); 
            self.navToCase(component);
        }
    },
    uploadFile: function(component, file, fileContents) {
        var self = this;
        var action = component.get("c.saveTheFile"); 
        
        action.setParams({
            parentId: component.get("v.caseId"),
            fileName: file.name,
            base64Data: encodeURIComponent(fileContents), 
            contentType: file.type
        });
        
        action.setCallback(this, function(a) {
            var attachId = a.getReturnValue();
            console.log(attachId);
            self.hideSpinner(component);
            self.navToCase(component);
        });
        
        $A.enqueueAction(action); 
    },
    showSpinner:function(component){
        component.set("v.IsSpinner",true);
    },
    hideSpinner:function(component){
        component.set("v.IsSpinner",false);
    },
    closeQuickAction : function(component){
        $A.get("e.force:closeQuickAction").fire();
    },
    navToCase:function(component){
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": component.get("v.caseId")
        });
        navEvt.fire();
    }
})