'use strict';

const propertyProjects = (() => {
  const photo = (src, alt) => ({ src: `assets/${src}.webp`, alt, illustrative: true });

  const gate = photo('projects/gated-entrance', 'Illustrative gated development entrance at sunset');
  const plots = photo('projects/planned-grounds', 'Illustrative aerial view of landscaped plots');
  const villa = photo('hero/villa-1', 'Illustrative glass-fronted villa and swimming pool at dusk');

  function demo(name, category, propertyType, image) {
    return {
      name: `${name} — Demo`,
      category,
      propertyType,
      isDemo: true,
      cardImage: image,
      heroImages: [image],
      overviewImage: image,
      description: `Illustrative ${propertyType.toLowerCase()} concept for the client demo.`,
      overview: 'This sample shows how a project listing will look. It does not represent an available property.',
    };
  }

  const demoProjects = {
    'greenfield-plots': demo('Greenfield Plots', 'plots', 'Residential plots',
      photo('properties/plots', 'Illustrative view of landscaped land parcels')),
    'sunrise-land-estate': demo('Sunrise Land Estate', 'plots', 'Land development',
      photo('locations/dholera-planning', 'Illustrative aerial view of a planned land development')),
    'royal-palm-villas': demo('Royal Palm Villas', 'villas', 'Luxury villas',
      photo('properties/villas', 'Illustrative villa with a swimming pool')),
    'elite-luxury-villas': demo('Elite Luxury Villas', 'villas', 'Luxury villas',
      photo('hero/villa-3', 'Illustrative contemporary villa at dusk')),
    'grand-villa-estate': demo('The Grand Villa Estate', 'villas', 'Luxury villas',
      villa),
    'urban-heights-residency': demo('Urban Heights Residency', 'residential', 'Residential apartments',
      photo('properties/residential', 'Illustrative apartment towers')),
    'skyline-residency': demo('Skyline Residency', 'residential', 'Residential apartments',
      photo('about/skyline-1', 'Illustrative high-rise residential skyline')),
    'greenview-apartments': demo('Greenview Apartments', 'residential', 'Residential apartments',
      photo('locations/growth-corridors', 'Illustrative residential towers beside landscaped grounds')),
  };

  // Add approved project facts here. A photo without illustrative: true should be verified.
  return {
    'balaji-upvan': {
      name: 'Balaji Upvan',
      category: null,
      featured: true,
      cardImage: photo('properties/plots', 'Illustrative aerial view of plotted land'),
      description: 'Explore the Balaji Upvan project preview and enquire for confirmed property details.',
      overview: 'This preview uses plotted-development imagery to illustrate the design concept. Official project information, plot sizes, and development status are still to be confirmed.',
      heroImages: [gate, plots, photo('projects/boulevard', 'Illustrative palm-lined residential boulevard')],
      overviewImage: plots,
      gallery: [
        gate,
        photo('projects/boulevard', 'Illustrative palm-lined residential boulevard'),
        photo('projects/garden', 'Illustrative garden path and landscaping'),
        photo('projects/gazebo', 'Illustrative garden pavilion with seating'),
        plots,
        photo('properties/plots', 'Illustrative green plots and access roads'),
      ],
      illustrativeHighlights: [
        ['building', 'Planned Development'],
        ['leaf', 'Green & Open Spaces'],
        ['road', 'Connectivity'],
        ['chart', 'Location Potential'],
      ],
      illustrativeAmenities: [
        ['leaf', 'Landscaped Gardens'],
        ['run', 'Jogging Track'],
        ['shield', 'Gated Community'],
        ['lamp', 'Street Lighting'],
        ['drop', 'Water Supply'],
        ['power', 'Power Connectivity'],
      ],
      relatedProjectIds: ['balaji-upvan-5-star-villa'],
    },
    'balaji-upvan-5-star-villa': {
      name: 'Balaji Upvan 5 Star Villa',
      category: null,
      featured: true,
      cardImage: photo('properties/villas', 'Illustrative villa and swimming pool'),
      description: 'Browse a villa design preview and request the approved project information from our team.',
      overview: 'The gallery illustrates a range of villa architectural styles. A verified site address, floor plans, and specifications are pending.',
      heroImages: [
        villa,
        photo('hero/villa-3', 'Illustrative contemporary villa and pool at twilight'),
        photo('hero/villa-4', 'Illustrative dark stone villa exterior'),
      ],
      overviewImage: photo('hero/villa-2', 'Illustrative white villa beside a pool at sunset'),
      gallery: [
        villa,
        photo('hero/villa-2', 'Illustrative white villa beside a pool at sunset'),
        photo('hero/villa-3', 'Illustrative contemporary villa and pool at twilight'),
        photo('hero/villa-4', 'Illustrative dark stone villa exterior'),
        photo('projects/villa-courtyard', 'Illustrative villa courtyard with a reflecting pool'),
      ],
      relatedProjectIds: ['balaji-upvan'],
    },
    'aakruti-green': {
      name: 'Aakruti Green',
      category: 'plots',
      propertyType: 'Residential plots',
      description: 'Explore the Aakruti Green residential plots and enquire for confirmed project details.',
      overview: 'Aakruti Green is listed as residential plots in our catalog. The site address, plot sizes, and current availability are to be confirmed.',
      cardImage: plots,
      heroImages: [plots],
      overviewImage: plots,
      gallery: [plots],
    },
    'mirrikh-project': {
      developer: 'Mirrikh Group',
      category: null,
      description: 'A specific Mirrikh Group project has yet to be identified. Project details will appear here once confirmed.',
    },
    ...demoProjects,
  };
})();

function projectDetailUrl(id) {
  return `project.html?project=${encodeURIComponent(id)}`;
}
