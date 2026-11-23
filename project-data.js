'use strict';

const SHOW_DEMO_PROJECT_DETAILS = true;

const projectDemoDetails = (() => {
  const photos = {
    plots: [
      ['properties/plots', 'Aerial view of planted land parcels'],
      ['projects/planned-grounds', 'Plotted grounds and internal roads'],
      ['projects/gated-entrance', 'Landscaped development entrance'],
      ['locations/dholera-planning', 'Aerial concept for a planned district'],
      ['projects/boulevard', 'Tree-lined community avenue'],
      ['projects/garden', 'Landscaped pedestrian path'],
      ['projects/gazebo', 'Garden pavilion and seating'],
    ],
    villas: [
      ['hero/villa-1', 'Glass-fronted villa and reflecting pool'],
      ['hero/villa-2', 'White villa with a pool terrace'],
      ['hero/villa-3', 'Contemporary villa exterior at twilight'],
      ['hero/villa-4', 'Dark stone villa and swimming pool'],
      ['projects/villa-courtyard', 'Private villa courtyard'],
      ['projects/garden', 'Landscaped garden path'],
      ['projects/gazebo', 'Outdoor garden pavilion'],
    ],
    residential: [
      ['properties/residential', 'Apartment buildings at sunset'],
      ['about/skyline-1', 'Contemporary residential towers'],
      ['locations/growth-corridors', 'Residential buildings beside landscaped grounds'],
      ['properties/residential-hero', 'High-rise residential community'],
      ['about/skyline-2', 'Modern tower exterior'],
      ['about/skyline-3', 'Contemporary apartment architecture'],
      ['projects/garden', 'Community garden and walking path'],
    ],
  };

  const features = {
    plots: {
      highlights: [['building', 'Planned Development'], ['leaf', 'Green Open Spaces'],
        ['road', 'Internal Road Network'], ['layers', 'Community Infrastructure']],
      amenities: [['leaf', 'Landscaped Gardens'], ['shield', 'Gated Entrance'], ['road', 'Internal Roads'],
        ['lamp', 'Street Lighting'], ['drop', 'Water Infrastructure'], ['run', 'Open Recreation Lawn']],
      sizeLabel: 'Plot Sizes',
    },
    villas: {
      highlights: [['home', 'Independent Villa Design'], ['leaf', 'Private Outdoor Space'],
        ['building', 'Contemporary Architecture'], ['layers', 'Shared Lifestyle Spaces']],
      amenities: [['leaf', 'Private Garden'], ['drop', 'Swimming Pool'], ['building', 'Clubhouse'],
        ['run', 'Fitness Room'], ['shield', 'Gated Entry'], ['lamp', 'Landscaped Promenade']],
      sizeLabel: 'Built-up Area',
    },
    residential: {
      highlights: [['building', 'Modern Apartments'], ['home', 'Family-friendly Design'],
        ['road', 'Separate Pedestrian Access'], ['layers', 'Shared Lifestyle Spaces']],
      amenities: [['run', 'Children’s Play Area'], ['chart', 'Gymnasium'], ['building', 'Community Hall'],
        ['leaf', 'Landscaped Gardens'], ['road', 'Parking Facilities'], ['shield', 'Controlled Entry']],
      sizeLabel: 'Unit Area',
    },
  };

  function sample({ category, photoStart, location, description, overview, propertyType, sizes, status, possession, distances }) {
    const pool = photos[category];
    const images = pool.map((_, index) => {
      const [path, alt] = pool[(photoStart + index) % pool.length];
      return { src: `assets/${path}.webp`, alt: `Illustrative image of ${alt.toLowerCase()}`, illustrative: true };
    });
    const { sizeLabel, ...items } = features[category];
    return {
      ...items,
      isDemo: true,
      category,
      location,
      description,
      overview,
      propertyType,
      heroImages: images.slice(0, 3),
      overviewImage: images[3],
      gallery: images.slice(1),
      specifications: { sizeLabel, sizes, status, possession },
      connectivity: ['Major road', 'Railway station', 'Airport', 'Town centre'].map((label, index) => ({
        label, detail: `Approx. ${distances[index]} km`, glyph: ['road', 'building', 'arrow', 'pin'][index],
      })),
    };
  }

  return {
    'aakruti-green': sample({
      category: 'plots', photoStart: 1, location: 'Willow Grove',
      description: 'A plotted-neighbourhood concept organised around a central green and calm residential lanes.',
      overview: 'This sample plan arranges residential plots around a central green, with shorter lanes branching from a tree-lined entrance road. Corner parcels illustrate how two frontages might support different house orientations, while quieter interior plots show space for gardens and setbacks. A shaded walking route links the entrance, lawn, and small seating pavilion so residents can move through the neighbourhood on foot. Shared water and lighting corridors are shown separately from private lots. The sample connectivity panel illustrates how a sales team could describe access once a site has been verified.',
      propertyType: 'Residential plots', sizes: '150–290 sq. yd.', status: 'Under development', possession: 'Q4 2027', distances: [4, 12, 26, 8],
    }),
    'balaji-upvan': sample({
      category: 'plots', photoStart: 2, location: 'Upvan Grove',
      description: 'A garden-led land development concept with pocket parks and a shaded avenue.',
      overview: 'The Upvan Grove concept uses a landscaped avenue to connect small groups of homesites, each with access to a pocket park or seating area. The sample layout separates wider frontage parcels near the avenue from quieter inward-facing lots. An entry pavilion shows how arrivals, visitor access, and maintenance could be organised without sending traffic through every lane. Garden paths curve around planted areas rather than following the road throughout. The plan demonstrates the balance between privately held land and shared space that buyers might evaluate for a long-term home.',
      propertyType: 'Residential plots', sizes: '180–360 sq. yd.', status: 'Site planning', possession: 'Q2 2028', distances: [6, 14, 31, 9],
    }),
    'balaji-upvan-5-star-villa': sample({
      category: 'villas', photoStart: 0, location: 'Upvan Heritage Quarter',
      description: 'A courtyard villa concept with flexible family rooms and private outdoor space.',
      overview: 'This villa concept places the living and dining rooms around a private courtyard, giving the main floor daylight while keeping the street-facing rooms more secluded. A flexible ground-floor guest suite can serve as a study, and the example upper floor groups family bedrooms away from the entertaining areas. Covered patios extend the dining space towards the garden in cooler months. A small shared clubhouse and landscaped walking route illustrate how independent homes might sit within a quieter community. The example configurations provide a starting point for discussing family layouts during the demo.',
      propertyType: '4 & 5 BHK villas', sizes: '2,700–4,400 sq. ft.', status: 'Under construction', possession: 'Q3 2028', distances: [5, 15, 28, 7],
    }),
    'mirrikh-project': sample({
      category: 'residential', photoStart: 3, location: 'Eastmere District',
      description: 'A fictional apartment concept used to demonstrate the project page for a developer listing.',
      overview: 'This illustrative apartment scheme uses a shared courtyard to organise several buildings and separate pedestrian arrivals from vehicles. The conceptual homes vary between compact plans for smaller households and wider family layouts with a separate study nook. A multipurpose ground-floor room could be shared between meetings, exercise, and community events. Planting at the perimeter illustrates how a walkway might buffer the buildings from the street. The gallery and connectivity panel demonstrate how imagery and locality information could be presented once a specific development has been identified for the developer.',
      propertyType: '2 & 3 BHK apartments', sizes: '1,080–1,760 sq. ft.', status: 'Concept planning', possession: 'Q4 2028', distances: [3, 9, 23, 6],
    }),
    'greenfield-plots': sample({
      category: 'plots', photoStart: 0, location: 'Meadowgate',
      description: 'A sample plotted community built around a continuous green walking loop.',
      overview: 'Greenfield illustrates a straightforward grid of homesites with a continuous green loop around the quieter lanes. Most parcels face a shared street rather than a boundary wall, making examples of frontage, access, and setbacks easy to compare during a walkthrough. The concept leaves the centre open for a lawn and pavilion and reserves a short service route away from that space. Several lot widths demonstrate the trade-off between additional garden space and a narrower house footprint. Shared lighting and landscape zones illustrate infrastructure planning without suggesting any works are currently underway.',
      propertyType: 'Residential plots', sizes: '125–270 sq. yd.', status: 'Infrastructure planning', possession: 'Q1 2028', distances: [3, 10, 24, 6],
    }),
    'sunrise-land-estate': sample({
      category: 'plots', photoStart: 3, location: 'Sunrise Meadow',
      description: 'A low-density plotting concept with larger homesites and landscaped edges.',
      overview: 'Sunrise Land Estate illustrates a lower-density neighbourhood with broader parcels and a landscaped edge separating the homesites from the main approach. The first cluster offers shorter walks to the entrance, while the rear cluster is arranged around a quieter recreation lawn. The plan shows how larger frontages could accommodate a courtyard, a small home office, or outdoor seating without prescribing a house design. A secondary loop illustrates maintenance access, while paths connect shaded seating near the central lawn. The fictional concept helps compare plot sizes, street hierarchy, and open-space arrangements.',
      propertyType: 'Plotted development', sizes: '220–420 sq. yd.', status: 'Early site works', possession: 'Q3 2028', distances: [8, 18, 33, 13],
    }),
    'royal-palm-villas': sample({
      category: 'villas', photoStart: 1, location: 'Palmhaven Quarter',
      description: 'A villa neighbourhood concept with deep gardens and shaded pool terraces.',
      overview: 'Royal Palm demonstrates villa layouts with deep rear gardens and shaded terraces for outdoor meals. A double-height living room faces the garden, while service spaces and parking sit closer to the street for practical everyday use. The sample larger villa adds a family lounge upstairs, while the smaller plan emphasises a broad ground-floor living area. Narrow residential lanes branch from a common avenue with planting at each entrance. The concept also illustrates a shared pool and gathering room for occasions that need more space than a private garden can offer.',
      propertyType: '4 BHK villas', sizes: '2,600–3,500 sq. ft.', status: 'Under construction', possession: 'Q2 2028', distances: [4, 13, 26, 8],
    }),
    'elite-luxury-villas': sample({
      category: 'villas', photoStart: 2, location: 'Cedar Lantern',
      description: 'A contemporary villa concept with sheltered courtyards and flexible work areas.',
      overview: 'The Elite villa concept uses sheltered courtyards to bring daylight into the centre of each home. The ground-floor study has access near the entrance, keeping work and guest visits away from the quieter upstairs bedrooms. Wider example layouts make room for a secondary family lounge, while smaller configurations retain the same private outdoor area. The landscaped entry and shared fitness spaces illustrate a compact common zone that leaves more space between homes. The sample is designed to compare daylight, privacy, and the relationship between everyday rooms and outdoor living.',
      propertyType: '3 & 4 BHK villas', sizes: '2,350–3,650 sq. ft.', status: 'Structural works', possession: 'Q4 2028', distances: [6, 16, 30, 11],
    }),
    'grand-villa-estate': sample({
      category: 'villas', photoStart: 3, location: 'Crescent Estate',
      description: 'An estate-home concept with adaptable suites and an avenue of garden plots.',
      overview: 'The Grand Villa Estate preview shows larger family homes arranged along a planted avenue with deeper front setbacks. The sample floor plan separates formal entertaining areas from a more casual kitchen and garden dining area. A ground-floor suite illustrates options for multi-generational households, and the larger configuration introduces an independent work or hobby room. Garden setbacks allow the example houses to open to different sides of the plot without facing directly into neighbours’ living areas. A shared pavilion provides a place for gatherings while leaving the residential lanes relatively quiet.',
      propertyType: '4 & 5 BHK estate villas', sizes: '3,150–4,700 sq. ft.', status: 'Design development', possession: 'Q2 2029', distances: [7, 17, 34, 12],
    }),
    'urban-heights-residency': sample({
      category: 'residential', photoStart: 0, location: 'Alder Cross',
      description: 'An apartment concept with an active courtyard and family-friendly floor plans.',
      overview: 'Urban Heights groups its example apartment towers around a central courtyard, with car access placed at the perimeter. Compact two-bedroom plans show efficient living and dining layouts, while wider three-bedroom apartments provide more room for family visits and everyday storage. A shaded seating area near the play space gives caregivers a place to sit without blocking the main pedestrian route. The sample ground floor combines shared services and a multipurpose room near the entry. The concept demonstrates how unit choice, access, and shared facilities might fit a range of household needs.',
      propertyType: '2 & 3 BHK apartments', sizes: '980–1,640 sq. ft.', status: 'Foundation works', possession: 'Q3 2028', distances: [2, 8, 19, 5],
    }),
    'skyline-residency': sample({
      category: 'residential', photoStart: 1, location: 'Highcrest Quarter',
      description: 'A residential tower concept with corner layouts and shared indoor amenities.',
      overview: 'Skyline Residency illustrates compact towers that leave room for a pedestrian spine between the entrances. Sample corner units use glazing on two sides to bring more daylight into the living area, while interior plans offer a simpler layout with fewer corridors. A shared ground-floor lounge faces the landscaped walk, and resident parking is approached from a separate edge. The example upper floors highlight how balcony placement can influence privacy, orientation, and outdoor use. The concept provides material for comparing more compact homes with larger units intended for growing families.',
      propertyType: '2 & 3 BHK apartments', sizes: '1,120–1,870 sq. ft.', status: 'Under construction', possession: 'Q1 2029', distances: [4, 7, 20, 6],
    }),
    'greenview-apartments': sample({
      category: 'residential', photoStart: 2, location: 'Greenbank Commons',
      description: 'A garden-facing apartment concept with shorter walking routes and flexible plans.',
      overview: 'Greenview arranges sample apartment buildings so living rooms and balconies can look towards planted courtyards rather than the service approach. A continuous path links the entrances, play space, and community room without requiring residents to cross the main parking aisle. The example two-bedroom homes make practical use of smaller footprints, while selected three-bedroom layouts add a flexible room for work or visiting family. Landscape edges create places to sit as well as a buffer around pedestrian routes. The concept helps demonstrate how shared greenery and accessible circulation can shape everyday apartment living.',
      propertyType: '2 & 3 BHK apartments', sizes: '1,040–1,730 sq. ft.', status: 'Site development', possession: 'Q4 2028', distances: [5, 11, 25, 9],
    }),
  };
})();

const propertyProjects = (() => {
  const photo = (src, alt) => ({ src: `assets/${src}.webp`, alt, illustrative: true });

  const plots = photo('projects/planned-grounds', 'Illustrative aerial view of landscaped plots');
  const villa = photo('hero/villa-1', 'Illustrative glass-fronted villa and swimming pool at dusk');

  function demo(name, category, propertyType, image) {
    return {
      name: `${name} — Demo`,
      category,
      propertyType,
      isDemo: true,
      cardImage: image,
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

  // Keep confirmed facts here. Illustrative detail fields belong in projectDemoDetails.
  return {
    'balaji-upvan': {
      name: 'Balaji Upvan',
      category: null,
      featured: true,
      cardImage: photo('properties/plots', 'Illustrative aerial view of plotted land'),
      relatedProjectIds: ['balaji-upvan-5-star-villa'],
    },
    'balaji-upvan-5-star-villa': {
      name: 'Balaji Upvan 5 Star Villa',
      category: null,
      featured: true,
      cardImage: photo('properties/villas', 'Illustrative villa and swimming pool'),
      relatedProjectIds: ['balaji-upvan'],
    },
    'aakruti-green': {
      name: 'Aakruti Green',
      category: 'plots',
      propertyType: 'Residential plots',
      cardImage: plots,
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
