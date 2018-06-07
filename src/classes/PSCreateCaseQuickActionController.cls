public class PSCreateCaseQuickActionController {
    @AuraEnabled
    public static List<String> getStatusOptions()
    {
        Schema.DescribeFieldResult fieldResult = Case.Status.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        
        List<String> retList = new List<String>();
        retList.add('');
        
        for ( Schema.PicklistEntry f : ple)
        {
            retList.add(f.getLabel());
        }
        
        retList.sort();
        return retList;
    }
    
    @AuraEnabled
    public static String saveCase(String params)
    {
        System.debug('saveCase invoked...');
        Map<String, String> paramMap = (Map<String, String>)JSON.deserialize(params,   Map<String, String>.class);
        System.debug(JSON.serializePretty(paramMap));
        PSResponse resp = new PSResponse();
        
        try
        {
            Case c = new Case();
            if (paramMap.containsKey('contactId'))  c.ContactId = paramMap.get('contactId');
            if (paramMap.containsKey('status'))  c.Status = paramMap.get('status');
            if (paramMap.containsKey('subject'))  c.Subject = paramMap.get('subject');
            if (paramMap.containsKey('description'))  c.Description = paramMap.get('description');
            if (paramMap.containsKey('latitudeField') && paramMap.containsKey('latitude'))  c.put(paramMap.get('latitudeField'), Decimal.valueOf(paramMap.get('latitude')));
            if (paramMap.containsKey('longitudeField') && paramMap.containsKey('longitude'))  c.put(paramMap.get('longitudeField'), Decimal.valueOf(paramMap.get('longitude')));
            
            insert c;
            
            resp.data = c.Id;
        }
        catch (exception e)
        {
            resp.status = PSResponse.ERROR;
            resp.msg = e.getMessage();
        }
        
        return  JSON.serialize(resp);
    }
    
    @AuraEnabled
    public static Id saveTheFile(Id parentId, String fileName, String base64Data, String contentType) { 
        System.debug('parentId=' + parentId);
        System.debug('fileName=' + fileName);
        base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        
        /*
Attachment a = new Attachment();
a.parentId = parentId;

a.Body = EncodingUtil.base64Decode(base64Data);
a.Name = fileName;
a.ContentType = contentType;

insert a;

return a.Id;
*/
        FeedItem fi = new FeedItem();
        fi.parentId = parentId;
        //fi.Body = 'File (' + fileName + ') uploaded';
        fi.Body = 'File attached';
        insert fi;
        
        ContentVersion version = new ContentVersion();
        version.Title = fileName;
        version.PathOnClient = fileName;
        version.VersionData = EncodingUtil.base64Decode(base64Data);
        version.ContentLocation = 'S';
        insert version;
        
        // After you insert the ContentVersion object, a base 'ContentDocument' is established
        // The ID of the ContentDocument is what you need to attach the file to the Chatter post.
        version = [SELECT ID,ContentDocumentId FROM ContentVersion WHERE ID=:version.id];
        
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = version.ContentDocumentId;
        cdl.LinkedEntityId = parentId;
        cdl.ShareType = 'V';
        insert cdl;
        
        FeedAttachment fa = new FeedAttachment();
        fa.Type = 'Content';
        fa.FeedEntityId = fi.Id;
        fa.RecordId = version.Id;
        insert fa;    
        
        return cdl.Id;
        
    }
}