
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var valueEHRID = ["", "", ""];

var BMI = 0;

var first_open = true;
var count = 0;

/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function pridobiPodatke(){
	var sessionId=getSessionId();
	
  ehrId = $("#EHR-ID").val();

  if(!ehrId || ehrId.trim().length == 0){
      $("#obvestilo-id").append("<span class='obvestilo " +
                      "label-danger fade-in'>EHR polje je prazno!<br></span><br><br>");
   } else {
	$.ajax({
    	url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
    	type: 'GET',
    	headers: {
        	"Ehr-Session": sessionId
    	},
    	success: function (data) {
        	$("#imeU").val(data.party.firstNames);
        	$("#priimekU").val(data.party.lastNames);
    	}
	});

	$.ajax({
    	url: baseUrl + "/view/" + ehrId + "/weight",
    	type: 'GET',
    	headers: {
        	"Ehr-Session": sessionId
    	},
    	success: function (teza) {
                $.ajax({
                    url: baseUrl + "/view/" + ehrId + "/height",
                    type: 'GET',
                    headers: {
                        "Ehr-Session": sessionId
                    },
                    success: function (visina) {
                        $("#visinaU").val(visina[0].height);
                        $("#tezaU").val(teza[0].weight);
						
						narisiGraf(parseFloat(visina[0].height), parseFloat(teza[0].weight));
                    },
	            error: function(err) {
	            	$("#obvestilo-id").append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!</span><br>");
                return;
	            }
                });
    		},
	            error: function(err) {
	            	$("#obvestilo-id").append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!</span><br>");
                return;
	            }
		});
	}
}
 
function generirajPodatke1to3() {
    generirajPodatke(0);
    generirajPodatke(1);
    generirajPodatke(2);
}

if (first_open) {
	generirajPodatke1to3();
}

function prikazi(stPacienta) {
	if (stPacienta == 0) {
			if (valueEHRID[0] != "") {
				document.getElementById('EHR-ID').value=valueEHRID[0];
			} else {
				$("#obvestilo-id").append("<span class='obvestilo " +
                      "label-danger fade-in'>EHR se ni generiran!<br></span><br><br>");
			}
	} else if (stPacienta == 1) {
			if (valueEHRID[1] != "") {
				//$('EHR-ID').value=valueEHRID[1];
				document.getElementById('EHR-ID').value=valueEHRID[1];
			} else {
				$("#obvestilo-id").append("<span class='obvestilo " +
                      "label-danger fade-in'>EHR se ni generiran!<br></span><br><br>");
			}
	} else if (stPacienta == 2) {
			if (valueEHRID[2] != "") {
				//$('EHR-ID').value=valueEHRID[2];
				document.getElementById('EHR-ID').value=valueEHRID[2];
			} else {
				$("#obvestilo-id").append("<span class='obvestilo " +
                      "label-danger fade-in'>EHR se ni generiran!<br></span><br><br>");
			}
	}
}

function generirajPodatke(stPacienta) {
    var sessionId = getSessionId();
   
    var ime = "";
	var priimek = "";
	var ehrId = "";
    
    if (stPacienta == 0) {
        ime = "Frenk";
        priimek = "Kafe";
    } else if (stPacienta == 1) {
        ime = "Angelca";
        priimek = "Buteljko";
    } else if (stPacienta == 2) {
        ime = "Gatis";
        priimek = "Kandis";
    }
   
    $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	$.ajax({
	    url: baseUrl + "/ehr",
	    type: 'POST',
	    success: function (data) {
	        var ehrId = data.ehrId;
	        var partyData = {
	            firstNames: ime,
	            lastNames: priimek,
	            partyAdditionalInfo: [
	            	{key: "ehrId", value: ehrId},
	            	]
	        };
	        $.ajax({
	            url: baseUrl + "/demographics/party",
	            type: 'POST',
	            contentType: 'application/json',
	            data: JSON.stringify(partyData),
	            success: function (party) {
	                if (party.action == 'CREATE') {
	                	count++;
	                	if (!first_open) {
	                    $("#obvestilo-id").append("<span class='obvestilo " +
                      "label label-success'>Ustvarjen nov uporabnik!<br>'" +
                      ehrId + "'.</span><br><br>"); 
	                	} if (count == 3) {count = 4; first_open = false;}
                      
                      if (stPacienta == 0) {
                      	meritve(ehrId, "2003-03-16T07:17", "175", "70", "37", "110", "75", "98");
                      } else if (stPacienta == 1) {
                      	meritve(ehrId, "2004-02-15T07:20", "130", "45", "36.5", "115", "70", "97");
                      } else if (stPacienta == 2) {
                      	meritve(ehrId, "2005-05-07T07:15", "190", "150", "36", "120", "90", "98");
                      }
                      
                      valueEHRID[stPacienta] = ehrId;
	                  return ehrId;
	                }
	            },
	            error: function(err) {
	            	$("#obvestilo-id").append("<span class='obvestilo label " +
                "label-danger fade-in'>Napaka '" +
                JSON.parse(err.responseText).userMessage + "'!</span><br>");
                return;
	            }
	        });
	    }
	});
  return ehrId;
}

function narisiGraf(visina, teza)  {
	$("#fillgauge1").empty();
	
	bmi = teza / (visina * visina / 10000);
	bmi = bmi.toFixed(2);

    var options = liquidFillGaugeDefaultSettings();
    options.displayPercent = false;
    options.circleColor = "#B3F341";
    
    if (bmi < 18.5) {
    	options.waveColor = "#C0C0C0";
    } else if(bmi < 25) {
    	options.waveColor = "#B3F341";
    } else if(bmi < 30) {
    	options.waveColor = "#FAF63B";
    } else if(bmi < 40) {
    	options.waveColor = "#FF9F1F";
    } else {
    	options.waveColor = "#FC0012";
    }
    
    var gauge1 = loadLiquidFillGauge("fillgauge1", bmi, options);
}

function meritve(ehrId, datumInUra, telesnaVisina, telesnaTeza, telesnaTemperatura, sistolicniKrvniTlak, diastolicniKrvniTlak, nasicenostKrviSKisikom) {
    var sessionId = getSessionId();
    
    $.ajaxSetup({
	    headers: {"Ehr-Session": sessionId}
	});
	var podatki = {
	    "ctx/language": "en",
	    "ctx/territory": "SI",
	    "ctx/time": datumInUra,
	    "vital_signs/height_length/any_event/body_height_length": telesnaVisina,
	    "vital_signs/body_weight/any_event/body_weight": telesnaTeza,
	   	"vital_signs/body_temperature/any_event/temperature|magnitude": telesnaTemperatura,
	    "vital_signs/body_temperature/any_event/temperature|unit": "°C",
	    "vital_signs/blood_pressure/any_event/systolic": sistolicniKrvniTlak,
	    "vital_signs/blood_pressure/any_event/diastolic": diastolicniKrvniTlak,
	    "vital_signs/indirect_oximetry:0/spo2|numerator": nasicenostKrviSKisikom
	};
	var parametriZahteve = {
	    ehrId: ehrId,
	    templateId: 'Vital Signs',
	    format: 'FLAT'
	};
	$.ajax({
	    url: baseUrl + "/composition?" + $.param(parametriZahteve),
	    type: 'POST',
	    contentType: 'application/json',
	    data: JSON.stringify(podatki),
	    success: function (res) {
	        return;
	    },
	    error: function(err) {
	    	$("#obvestilo-id").append(
        "<span class='obvestilo label label-danger fade-in'>Napaka '" +
        JSON.parse(err.responseText).userMessage + "'!</span><br>");
	    }
	});
    
}