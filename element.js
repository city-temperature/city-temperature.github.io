!(function () {
    // ------------------------------------------------------------------------
    const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props)
    // ------------------------------------------------------------------------
    const span = (html, part) => `<span part="${part}">${html}</span>`
    // ************************************************************************
    customElements.define("city-temperature", class extends HTMLElement {
        connectedCallback() {
            // ------------------------------------------------------------
            let [
                lat,
                lon = this.getAttribute("lon") || 4.904,
                unit = this.getAttribute("unit") || "C",
            ] = (this.getAttribute("location") || this.getAttribute("lat") || 52.366).split(",")
            // ------------------------------------------------------------
            this
                .attachShadow({ mode: "open" })
                .append(
                    createElement("style", { innerHTML: `:host{display:inline-block}` }),
                    this.getAttribute("prefix") || "The temperature in ",
                    this.getAttribute("city") || "", " is ",
                    createElement("location-temperature", {
                        part: "temperature",
                        lat, lon, unit
                    }),
                )
        }
    })
    // ************************************************************************
    customElements.define("location-temperature", class extends HTMLElement {
        async connectedCallback() {
            // ------------------------------------------------------------
            let {
                lat = this.getAttribute("lat") || console.error("No lat"),
                lon = this.getAttribute("lon") || console.error("No lon"),
                unit = this.getAttribute("unit") || "C",
            } = this;
            // ------------------------------------------------------------
            const data = await (
                await fetch(
                    `https://api.open-meteo.com/v1/forecast` +
                    `?latitude=${lat}&longitude=${lon}` +
                    (unit == "F" ? `&temperature_unit=fahrenheit` : "") +
                    `&current_weather=true`,
                )
            ).json()
            // console.log(data)
            // ------------------------------------------------------------
            if (data?.reason?.includes("one minute")) {
                this.innerHTML = "🔄"
                setTimeout(() => this.connectedCallback(), 60000) // one minute
            } else {
                this.innerHTML =
                    span(data.current_weather.temperature, "temperature") +
                    " " +
                    span(data.current_weather_units.temperature, "unit")
            }
        }
    });
}());