$(document).ready( function() {

    $(".ahoy-version").text("v" + browser.runtime.getManifest().version);

    browser.storage.local.get( [ "proxy_addr" ], function( result) {
        $("#proxyaddr").text( result.proxy_addr );    
    } );

    browser.storage.local.get( [ "statistics" ], function(result) {
        $("#stats").prop("checked", result.statistics);
        if(result.statistics) {
            $(".stats-status")
                .addClass("activo")
                .removeClass("inactivo")
                .text("Ligada");
        } else {
            $(".stats-status")
                .addClass("inactivo")
                .removeClass("activo")
                .text("Desligada");
        }
    });

    browser.tabs.query( { active: true, currentWindow: true }, function(tabs) {
        var currentTab = tabs[0];
        
        var activo = browser.extension.getBackgroundPage().ahoy.is_url_in_list(currentTab.url);

        if( activo ) {
            $(".status.activo").show();
            $(".status.inactivo").hide();
        } else {
            $(".status.activo").hide();
            $(".status.inactivo").show();
        }
    });

    $("#verSites").click( function() {
        var newURL = "https://sitesbloqueados.pt/?utm_source=ahoy&utm_medium=firefox-popup&utm_campaign=Ahoy%20Firefox";
        browser.tabs.create({ url: newURL });
    });

    $(".inquerito").click( function() {
        browser.tabs.create({ url: "https://donativos.ahoy.pro/?utm_source=ahoy&utm_medium=firefox-popup&utm_campaign=Ahoy%20Firefox" });
    });

    $("#actualizarPagina").click( function() {
        if($(this).attr("disabled")) { // HERE
            return false;
        };

        browser.extension.getBackgroundPage().ahoy.update_proxy( true );
        browser.extension.getBackgroundPage().ahoy.update_site_list();

        $(this).attr("disabled", "");
        
        //Set the waiting height
        $(".waiting").height( $(".info").height() );

        // Hide
        $(".info").hide();
        $(".waiting").show();

        setTimeout( function() {

            $("#proxyaddr").text( browser.extension.getBackgroundPage().ahoy.proxy_addr ); 
            $("#forcarProxy").attr("disabled", false);

            $(".info").show();
            $(".waiting").hide();

            // Refresh the page
            browser.tabs.reload();

            window.close();
          
        }, 2000 );

    });

    $("#desactivarAhoy").click( function() {
        browser.extension.getBackgroundPage().ahoy.disable();
        // Refresh the page
        browser.tabs.reload();
        
    });

    $("#activarAhoy").click( function() {
        browser.extension.getBackgroundPage().ahoy.enable();
        // Refresh the page
        browser.tabs.reload();
   });

    $("#stats").change( function() {
        if(this.checked) {
            $(".stats-status")
                .addClass("activo")
                .removeClass("inactivo")
                .text("Ligada");
            browser.extension.getBackgroundPage().ahoy.enable_stats();
        } else {
            $(".stats-status")
                .addClass("inactivo")
                .removeClass("activo")
                .text("Desligada");
            browser.extension.getBackgroundPage().ahoy.disable_stats();
        }
    });

});