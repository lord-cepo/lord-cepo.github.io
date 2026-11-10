(() => {
  const chapters = [["gas_e_urti.html?slide=1", "gas_e_urti.html?slide=2", "gas_e_urti.html?slide=3", "gas_e_urti.html?slide=4", "gas_e_urti.html?slide=5", "gas_e_urti.html?slide=6", "gas_e_urti.html?slide=7", "gas_e_urti.html?slide=8"], ["introduzione_capitolo_2.html", "scatole_energia.html?view=1", "scatole_energia.html?view=2", "scatole_energia.html?view=3", "regole_scelta.html", "esempi_reversibilita.html"], ["scatole_energia_indipendenti.html?view=1", "scatole_energia_indipendenti.html?view=2", "scatole_energia_indipendenti.html?view=3"], ["conteggio.html", "boltzmann_temperatura.html", "entropia.html", "entropia_calore.html"], ["introduzione_capitolo_5.html", "gas_reticolare.html", "acqua_critica.html", "inserimento_particelle.html", "campo_medio.html", "potts.html", "modello_xy.html", "blume_capel.html", "lennard_jones.html", "lattice_boltzmann.html"], ["forza_entropica.html", "polimero_entropico.html", "pressione_osmotica.html", "sedimentazione.html", "attrazione_esclusione.html", "tensione_superficiale.html", "fluttuazioni_membrana.html", "stabilita_film.html"], ["bosoni_fermioni.html", "occupazione_quantistica.html", "calore_specifico_rame.html", "modi_acustici_ottici.html", "modello_debye.html", "radiazione_corpo_nero.html"]];
  const bar = document.querySelector('.course-bar');
  if (new URLSearchParams(location.search).get('embed') === '1') {
    document.body.classList.add('course-embedded');
    return;
  }
  const track = bar?.querySelector('input[type="range"]');
  if (!track) return;
  const file = location.pathname.split('/').pop();
  const slides = chapters.find(chapter => chapter.some(url => url.split('?')[0] === file));
  if (!slides) return;
  const gas = file === 'gas_e_urti.html';
  const energyDeck = file === 'scatole_energia.html' || file === 'scatole_energia_indipendenti.html';
  const query = new URLSearchParams(location.search);
  const first = slides.findIndex(url => url.split('?')[0] === file);
  const requestedView = Number(query.get('view'));
  const view = energyDeck && Number.isInteger(requestedView) && requestedView >= 1 && requestedView <= 3 ? requestedView : 1;
  let index = gas ? Number(query.get('slide')) - 1 : first + view - 1;
  track.max = slides.length;
  track.disabled = slides.length < 2;
  if (!Number.isInteger(index) || index < 0 || index >= slides.length) index = 0;
  const previous = bar.querySelector('[data-previous]');
  const next = bar.querySelector('[data-next-slide]');
  const counter = bar.querySelector('[data-slide-position]');
  const end = bar.querySelector('.course-next');
  const localSlider = gas ? document.querySelector('[data-slide-slider]') : null;
  const localNext = energyDeck ? document.getElementById('next') : null;
  const localPrevious = energyDeck ? document.getElementById('prev') : null;
  for (let i = 1; i < view; i++) localNext.click();
  function updateEnd() {
    if (end) end.hidden = index !== slides.length - 1;
  }
  function link(anchor, target) {
    if (target === undefined) {
      anchor.removeAttribute('href');
      anchor.setAttribute('aria-disabled', 'true');
    } else {
      anchor.setAttribute('href', target);
      anchor.removeAttribute('aria-disabled');
    }
  }
  function render(position) {
    counter.textContent = `${position + 1} / ${slides.length}`;
    track.setAttribute('aria-valuetext', `Slide ${position + 1} of ${slides.length}`);
    link(previous, slides[position - 1]);
    link(next, slides[position + 1]);
  }
  function select(position) {
    if (position === index) return;
    if (localSlider) {
      localSlider.value = position + 1;
      localSlider.dispatchEvent(new Event('input'));
    } else if (energyDeck && slides[position].split('?')[0] === file) {
      const button = position > index ? localNext : localPrevious;
      for (let i = 0; i < Math.abs(position - index); i++) button.click();
    } else {
      location.assign(slides[position]);
      return;
    }
    index = position;
    track.value = position + 1;
    render(position);
    updateEnd();
    if (location.protocol !== 'file:') history.replaceState(null, '', slides[position]);
  }
  track.value = index + 1;
  render(index);
  updateEnd();
  track.addEventListener('input', () => render(Number(track.value) - 1));
  track.addEventListener('change', () => select(Number(track.value) - 1));
  if (localSlider || energyDeck) {
    previous.addEventListener('click', event => {
      event.preventDefault();
      if (index > 0) select(index - 1);
    });
    next.addEventListener('click', event => {
      event.preventDefault();
      if (index + 1 < slides.length) select(index + 1);
    });
  }
})();
