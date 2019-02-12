/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		//variuable tipo cookie guardada desde el archivo cognito-auth.js
		//alert(localStorage.getItem("usuarioEmailLogin"));
		$("#TablaInvoiceList").hide();
		$("#insertInvoice").show();

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);*/

		cantidadFacturas();
 		$("#welcomex").text("Welcome "+localStorage.getItem("usuarioEmailLogin"));
    }



};



var x = 0; //initial text box count
var authToken; //super importante variable cognito que evita accesos indebidos a los metodos del servidor

var todoOk=true;
var entro1vez=false;
var cont_i;
var obj = [];
function cantidadFacturas(){
	var maxFacturas=50;
	var cantidadFact = prompt("how many invoices will you enter? (MIN=1 And MAX=50)", "1");
	//var cantidadFact = 2

	if (cantidadFact == null || cantidadFact == "") {
		txt = "User cancelled the Entry.";

	} else if(cantidadFact<=maxFacturas && cantidadFact>=1){
		var max_fields      = 50; //maximum input boxes allowed
		var wrapper         = $(".input_fields_wrap"); //Fields wrapper
		var add_button      = $("#addFields"); //Add button ID

		for(i=x;i<cantidadFact;i++){
			if(x < max_fields){ //max input box allowed
				x++; //text box increment
				//agregamos 1 fila y 3 columnas, como id factura, serial y su fecha
				$(wrapper).append('<tr id="tr-'+i+'" ><td>'+i+'</td>'+
							      '<td><input class="filasData" id="invoice-'+i+'"  type="number" name="mytext[]"/></td>'+
				                  '<td><input class="filasData" id="serial-'+i+'"  type="number" name="mytext2[]"/></td>'+
								  '<td><input class="filasData datepicker" id="date-'+i+'" value="'+obtenerFechaActual()+'" type="text" name="mytext3[]"/></td>'+
								  '<td><input class="filasData" id="serial-'+i+'"  type="number" name="mytext3[]"/></td>'+
								  '<td><select  name="mytext3[]"><option value="1">Days</option><option value="2">Weeks</option><option value="3">Months</option><option value="4">Years</option></select></td>'+
								  '<td><a href="#" id="a-'+i+'" class="remove_field">Remove</a></td></tr> '); //add input box

			}
		}
		//alert(x)
		//si quiero eliminar este campo
		$(wrapper).on("click",".remove_field", function(e){ //user click on remove text
			e.preventDefault();
			$(this).closest('tr').remove();
			//mejor no decrementamos para no perder la secuencia
			//x--;
		})
		//si quiero agregar otra numero de factura mas
		$(add_button).click(function(e){ //on add input button click
            e.preventDefault();
			if(x < max_fields){ //max input box allowed

				$(wrapper).append('<tr id="tr-'+x+'" ><td>'+x+'</td>'+
								  '<td><input class="filasData" id="invoice-'+x+'"  type="text" name="mytext[]"/></td>'+
				                  '<td><input class="filasData" id="serial-'+x+'"  type="text" name="mytext2[]"/></td>'+
								  '<td><input class="filasData" id="date-'+i+'" value="'+obtenerFechaActual()+'" type="text" name="mytext3[]"/></td>'+
								  '<td><a href="#" id="a-'+x+'" class="remove_field">Remove</a></td></tr> '); //add input box
			   x++; //text box increment
			}
		});

	}else{
		alert("WARNING: Limit incorrect, your entry was "+cantidadFact);
	}

}

function obtenerFechaActual(){
	var fullDate = new Date();
	//console.log(fullDate);
	var twoDigitMonth = (fullDate.getMonth()+1)+"";if(twoDigitMonth.length==1)	twoDigitMonth="0" +(twoDigitMonth);
	var twoDigitDate = fullDate.getDate()+"";if(twoDigitDate.length==1)	twoDigitDate="0" +twoDigitDate;
	var currentDate =  fullDate.getFullYear()+"/" + (twoDigitMonth) + "/" +twoDigitDate ;
	//console.log(currentDate);
	return currentDate;
}

function getDataAJson(){
	obj = [];
 	var elems = $("input[class=filasData]");
	//console.log(elems.size())
  warrantyDate='15-07-2020';
	dataCreation=obtenerFechaActual();
	warrantyStatus='Active';
	userCreation=localStorage.getItem("usuarioEmailLogin"); //dato obtenido del archivo cognito-auth.js , linea 86
	movementStatus='SOLD';
	manufacturing="org.ubiot.Safe4Riders.Manufacturing#1611";

	for (i = 0; i < elems.length; i += 3) {
		invoice=(elems[i+0].value);
		serial=(elems[i+1].value);
		date=(elems[i+2].value);
		//var id = this.getAttribute('val');
		//var email = this.value;
		tmp = { "class": "org.ubiot.bicicleta5.Bicycle", "GTIN": parseInt(invoice),"idInvoice": invoice, "SERIAL": parseInt(serial),"saleDate":date,"dataCreation":dataCreation,"warrantyDate":warrantyDate,"userCreation":userCreation,"warrantyStatus":warrantyStatus,"movementStatus": movementStatus,"manufacturing":manufacturing };
		obj.push(tmp);
	}
	todoOk=true;
	entro1vez=false;

	//aqui tenemos los datos en formato json listos para ser enviados al dynamoDB
	for(cont_i=0;cont_i<obj.length;cont_i++){
	   //console.log(obj[i]);
	    insertInvoice=JSON.stringify(obj[cont_i]);
		$.ajax({
			method: 'POST',
			url: _config.api.invokeUrl + '/getinvoices',
			headers: {
				Authorization: authToken
			},
			data:insertInvoice,
			contentType: 'json',
			success: completeInsert,
			error: function ajaxError(jqXHR, textStatus, errorThrown) {
				todoOk=false;
				console.error('Error requesting bicicletas: ', textStatus, ', Details: ', errorThrown);
				console.error('Response: ', jqXHR.responseText);
				alert('An error occured when requesting your bicicletas:\n' + jqXHR.responseText);
			}
		});
	}


}

function completeInsert(result) {


 //validacion doble por si acaso
 entro1vez=true;

  if(todoOk==true && entro1vez==true && cont_i==(obj.length)){
		 alert("invoices added successfully ");
  }
}

function getBike(){
	alert("programando aun")
}
/*global WildRydes _config*/

var WildRydes = window.WildRydes || {};
WildRydes.map = WildRydes.map || {};

var todasLasFilas={nada:"nada"};

(function rideScopeWrapper($) {		//WildRydes=localStorage.getItem("WildRydes");
	//console.log((WildRydes))


	var columnas=[
	 {"name":'bicycleId',"title":"Item ID","filterable":true,"visible":true,"type":"text","style":{"text-align":"center","width":"45%"},"data-breakpoints":"all"},
	 {"name":'idInvoice',"title":"Id Invoice","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'SERIAL',"title":"Serial Product","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'saleDate',"title":"Sale Date","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'warrantyStatus',"title":"Warranty Status","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'warrantyDate',"title":"Warranty Date","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'movementStatus',"title":"Movement Status","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"all"},
	 {"name":'GTIN',"title":"GTIN","filterable":false,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"xs sm md"},
	 {"name":'userCreation',"title":"User Creation","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"xs sm md"},
	 {"name":'dataCreation',"title":"Data Creation","filterable":true,"visible":true,"style":{"text-align":"center"},"data-breakpoints":"xs sm md"}

	];
    WildRydes.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });


    function requestInvoice(pickupLocation) {
		//alert(_config.api.invokeUrl)

	 // var id='4bfae518-813a-11e8-8af9-07d7321fb577';
		$.ajax({
				method: 'GET',
				url: _config.api.invokeUrl + '/getinvoices?bicycleId',//='+id,
				headers: {
					Authorization: authToken
				},
				contentType: 'application/json',
				success: completeRequest,
				error: function ajaxError(jqXHR, textStatus, errorThrown) {
					console.error('Error requesting bicicletas: ', textStatus, ', Details: ', errorThrown);
					console.error('Response: ', jqXHR.responseText);
					alert('An error occured when requesting your bicicletas:\n' + jqXHR.responseText);
				}
			});

    }

    function completeRequest(result) {

		todasLasFilas=result;
		//como el gateway regresa un objeto items toca descomprimirlo antes
		//todasLasFilas=JSON.stringify((todasLasFilas.Items))
		todasLasFilas=((todasLasFilas.Items))
		//todasLasFilas=todasLasFilas.replace("[", "");
		//todasLasFilas=todasLasFilas.replace("]", "");
		//var mydate = stringToDate("17/9/2014","dd/MM/yyyy","/");
		//console.log(todasLasFilas);
		// console.log('[{"options": { "expanded": "true" },"value":'+JSON.stringify(todasLasFilas)+'}]');
		filas='[{"options": { "expanded": true },'+(todasLasFilas)+'}]';
		filas=todasLasFilas;
		console.log(filas);
		jQuery(function($){
			$('#table2').footable({
				"showToggle":true,
				"toggleColumn": "last",
				"columns":(columnas),
				"rows":filas
			});
		});
		FooTable.get('#table2').pageSize(4);
		//console.log(todasLasFilas);
    }

    // Register click handler for #request button
    $(function onDocReady() {


        $('#signOut').click(function() { //activar este boton en alguna parte de la pagina
            WildRydes.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });
        $(WildRydes.map).on('pickupChange', handlePickupChanged);

        WildRydes.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Unicorn');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = "nada";
        event.preventDefault();
		$("#TablaInvoiceList").show();
		$("#insertInvoice").hide();
        requestInvoice(pickupLocation);
  }

	function handleRequestClick2(event) {
		$("#TablaInvoiceList").hide();
		$("#insertInvoice").show();

     }
	function stringToDate(_date,_format,_delimiter)
	{
				var formatLowerCase=_format.toLowerCase();
				var formatItems=formatLowerCase.split(_delimiter);
				var dateItems=_date.split(_delimiter);
				var monthIndex=formatItems.indexOf("mm");
				var dayIndex=formatItems.indexOf("dd");
				var yearIndex=formatItems.indexOf("yyyy");
				var month=parseInt(dateItems[monthIndex]);
				month-=1;
				var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
				return formatedDate;
	}

    function animateArrival(callback) {
        var dest = WildRydes.map.selectedPoint;
        var origin = {};

        if (dest.latitude > WildRydes.map.center.latitude) {
            origin.latitude = WildRydes.map.extent.minLat;
        } else {
            origin.latitude = WildRydes.map.extent.maxLat;
        }

        if (dest.longitude > WildRydes.map.center.longitude) {
            origin.longitude = WildRydes.map.extent.minLng;
        } else {
            origin.longitude = WildRydes.map.extent.maxLng;
        }

        WildRydes.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }


$("#listarFacturas").click(handleRequestClick);
$("#mostrarInsertarFacturas").click(handleRequestClick2);


}(jQuery));





app.initialize();
