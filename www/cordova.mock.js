if(window.navigator == undefined) {
    window.navigator = { };
}
setTimeout(function () {
    var event = new Event('deviceready');
    document.dispatchEvent(event);
}, 2000);
if (window.cordova == undefined) {
    window.cordova = {
        exec: function (success, fail, className, methodName, paras) {
            if (success != null) {
                success();
            }
        }
    };
}
navigator.contacts = {
    find: function(contactFields, contactSuccess, contactError, contactFindOptions) {
        var contacts = [
            {
                displayName: "Gwen Kasriel",
                name: {
                    familyName: 'Kasriel',
                    formatted:'Gwen Kasriel'
                },
                phoneNumbers: [
                    {
                        type: "string",
                        value: "6503195424",
                        pref: false
                    },
                    {
                        type: "string",
                        value: "6502049750",
                        pref: false
                    },
                    {
                        type: "string",
                        value: "+33638030557",
                        pref: false
                    }

                ]
            },
            {
                displayName: "John McLane",
                name: {
                    familyName: 'McLane',
                    formatted:'John McLane'
                },
                phoneNumbers: [
                    {
                        type: "string",
                        value: "4152728279",
                        pref: false
                    }
                ]
            },
            {
                displayName: "Cedric Sellin",
                name: {
                    familyName: 'Sellin',
                    formatted:'Cedric Sellin'
                },
                phoneNumbers: [
                    {
                        type: "string",
                        value: "6508045638",
                        pref: false
                    }
                ]
            }
        ];
        contactSuccess(contacts);
    }
};

var ContactFindOptions = function() {
    this.filter = "";
    this.multiple = false;
};
