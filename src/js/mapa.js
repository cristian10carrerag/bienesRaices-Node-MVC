(function() {
    const lat = 2.935877;
    const lng = -75.2705545;
    const mapa = L.map('mapa').setView([lat, lng ], 20);
    let marker;

    // Utilizar Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Pin del mapa
    marker = new L.marker([lat, lng], {
        draggable : true,
        autoPan : true
    })
    .addTo(mapa)

    // Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker = e.target
        const position = marker.getLatLng();
        console.log(position)

        mapa.panTo(new L.LatLng(position.lat, position.lng))

        //Obtener la información de la calle al soltar el pin
        geocodeService.reverse().latlng(position, 13).run(function(error, resultado) {
          //  console.log(resultado)

            marker.bindPopup(resultado.address.LongLabel)

            // Llenar los campos
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })

})()