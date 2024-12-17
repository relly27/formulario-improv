document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    const nacionalidad = document.getElementById("nacionalidad").value;
    const cedula = document.getElementById("cedula").value;
    const apiUrl = "http://172.16.2.8:3001"

    const url = `${apiUrl}/BuscarPersona/${nacionalidad}/${cedula}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al buscar la persona");
      }
      const data = await response.json();
      if (data.length > 0) {
        sessionStorage.setItem("persona", JSON.stringify(data[0]));
        sessionStorage.setItem('accessGranted', 'true');
        window.location.href = "formulario.html";
      } else {
        alert("Persona no encontrada");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al buscar la persona.");
    }
  });