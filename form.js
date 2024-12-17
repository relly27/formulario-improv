
if (sessionStorage.getItem('accessGranted') !== 'true') {
    // Redirige al usuario si no pasó por la página inicial
    window.location.href = '/';

} else {

    const apiUrl = "http://172.16.2.8:3001"

    const estadoSelect = document.getElementById('estado');
    const municipioSelect = document.getElementById('municipio');
    const parroquiaSelect = document.getElementById('parroquia');

    // Obtener estados

    function populateSelect(selectElement, options, textKey, valueKey) {
        selectElement.innerHTML = '<option value="">Seleccione una opción</option>'; // Limpiamos el select y agregamos la opción predeterminada
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option[valueKey];
            opt.textContent = option[textKey];
            selectElement.appendChild(opt);
        });
    }

    async function fetchEstados() {
        try {
            const response = await fetch(`${apiUrl}/obtenerEstados`);
            const estados = await response.json();
            populateSelect(estadoSelect, estados, 'estado', 'id_estado'); // Usamos 'nombre' como texto y 'id' como valor
        } catch (error) {
            // console.error("Error al obtener estados:", error);
        }
    }

    // Obtener municipios
    async function fetchMunicipios(estadoId) {
        try {
            const response = await fetch(`${apiUrl}/obtenerMunicipios=${estadoId}`);
            const municipios = await response.json();
            populateSelect(municipioSelect, municipios, 'municipio', 'id_municipio'); // Usamos 'nombre' como texto y 'id' como valor
        } catch (error) {
            // console.error("Error al obtener municipios:", error);
        }
    }

    // Obtener parroquias
    async function fetchParroquias(municipioId) {
        try {
            const response = await fetch(`${apiUrl}/obtenerParroquias=${municipioId}`);
            const parroquias = await response.json();
            populateSelect(parroquiaSelect, parroquias, 'parroquia', 'id_parroquia'); // Usamos 'nombre' como texto y 'id' como valor
        } catch (error) {
            // console.error("Error al obtener parroquias:", error);
        }
    }

    // Eventos para los cambios en los selectores
    estadoSelect.addEventListener('change', async () => {
        const estadoId = estadoSelect.value;
        municipioSelect.innerHTML = 'Seleccione un estado primero'; // Limpiamos municipios y parroquias
        parroquiaSelect.innerHTML = 'Seleccione un Municipio primero';
        if (estadoId) {
            await fetchMunicipios(estadoId); // Cargamos municipios correspondientes
        }
    });

    municipioSelect.addEventListener('change', async () => {
        const municipioId = municipioSelect.value;
        parroquiaSelect.innerHTML = ''; // Limpiamos parroquias
        if (municipioId) {
            await fetchParroquias(municipioId); // Cargamos parroquias correspondientes
        }
    });

    // Cargamos los estados al iniciar
    fetchEstados();

    // // Leer datos desde sessionStorage
    const data = JSON.parse(sessionStorage.getItem("persona"));
    data.segundo_nombre = (data.segundo_nombre === null) ? "" : data.segundo_nombre
    data.segundo_apellido = (data.segundo_apellido === null) ? "" : data.segundo_apellido

    function autoCompletarOCampos(inputId, valor) {
        const input = document.getElementById(inputId);
        if (valor) {
            input.value = valor;
            input.setAttribute("disabled", true);
        }
    }

    autoCompletarOCampos("nacionalidad", data.nacionalidad.replace(/\n/g, '').replace(/\s\s+/g, ''));
    autoCompletarOCampos("cedula", data.cedula);
    autoCompletarOCampos("nombres", data.primer_nombre + " " + data.segundo_nombre);
    autoCompletarOCampos("apellidos", data.primer_apellido + " " + data.segundo_apellido);
    autoCompletarOCampos("genero", (data.sexo.replace(/\n/g, '').replace(/\s\s+/g, '') === "M") ? "Masculino" : "Femenina");

    document.getElementById("formulario").addEventListener("submit", async (e) => {
        e.preventDefault();

        const loadMoreButton = document.querySelector(".load-more");
        loadMoreButton.classList.add("load-more--loading");

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: "No podrás deshacer esta acción.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) {
            loadMoreButton.classList.remove("load-more--loading");
            Swal.fire({
                icon: "info",
                title: "Cancelado",
                text: "Puedes editar la información antes de enviarla.",
            });
            return; // Salimos de la función
        }

        // Recopilamos los datos del formulario
        const datosFormulario = {
            cedula_id: parseInt(document.getElementById("cedula")?.value),
            primer_nombre: data.primer_nombre,
            segundo_nombre: data.segundo_nombre,
            primer_apellido: data.primer_apellido,
            segundo_apellido: data.segundo_apellido,
            email: document.getElementById("correo")?.value,
            telf: document.getElementById("telefono")?.value,
            nacionalidad: document.getElementById("nacionalidad")?.value,
            estado: document.getElementById("estado")?.selectedOptions[0]?.textContent,
            municipio: document.getElementById("municipio")?.selectedOptions[0]?.textContent,
            parroquia: document.getElementById("parroquia")?.selectedOptions[0]?.textContent,
            genero: data.sexo.replace(/\n/g, '').replace(/\s\s+/g, ''),
            descripcion: document.getElementById("descripcion")?.value
        };


        try {
            const response = await fetch(`${apiUrl}/personas`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosFormulario)
            });

            if (response.ok) {
                const respuesta = await response.json();
                // console.log("Respuesta del servidor:", respuesta);
                if (respuesta.error) {

                    loadMoreButton.classList.remove("load-more--loading");
                    setTimeout(() => {
                        Swal.fire({
                            icon: "error",
                            title: "Ups...",
                            text: "¡algo salio mal!"
                        });
                    }, 400)

                } else {
                    Swal.fire({
                        title: "¡Formulario enviado con éxito!",
                        text: "Sera redirigido en 2 Segundos",
                        icon: "success"
                    });                   // alert("Formulario enviado con éxito.");
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000)
                }
            } else {
                // console.error("Error en la solicitud:", response.statusText);
                loadMoreButton.classList.remove("load-more--loading");
                setTimeout(() => {
                    Swal.fire({
                        icon: "error",
                        title: "Ups...",
                        text: "¡Algo salió mal!",
                    });
                }, 300)

            }
        } catch (error) {
            // console.error("Error al enviar el formulario:", error);
            loadMoreButton.classList.remove("load-more--loading");
            setTimeout(() => {
                Swal.fire({
                    icon: "error",
                    title: "Ups...",
                    text: "¡Algo salió mal!",
                });
            }, 300)

        }

    });
}