var network = {
    container: document.querySelector('#network'),
    isLoaded: false,
    interaction: {
        navigationButtons: true,
        zoomView: false
    },
    options: {
        physics: {
            enabled: true,
            repulsion: {
                centralGravity: 0.0,
                springLength: 350,
                springConstant: 0.01,
                nodeDistance: 400,
                damping: 0.09
            },
            solver: 'repulsion'
        },
        edges: {
            width: 2,
            selectionWidth: 6,
            smooth: {
                type: 'horizontal',
                forceDirection: 'horizontal'
            }
        },
        groups: {
            collegue: {shape: 'circularImage', color: {border: chooseColor('collegue')}},
            contemporain: {shape: 'circularImage', color: {border: chooseColor('contemporain')}},
            collaborateur: {shape: 'circularImage', color: {border: chooseColor('collaborateur')}},
            famille: {shape: 'circularImage', color: {border: chooseColor('famille')}},
            otlet: {shape: 'circularImage', color: {border: chooseColor('otlet')}},
            institution: {shape: 'image', color: {border: chooseColor('institution')}},
            œuvre: {shape: 'image', color: {border: chooseColor('œuvre')}},
            évènement: {shape: 'image', color: {border: chooseColor('évènement')}}
        },
        interaction: {hover:true}
    },
    zoom: {
        max: 1,
        min: 0.2
    },
    selectedNode: undefined
}

fetch('data.json').then(function(response) {
    // Chargement de données...
    
    response.text().then(function(text) {
        // Traitement des données...
        var data = JSON.parse(text);

        Object.values(data.Entites).forEach(entite => {
            createNode(entite); });
        
        Object.values(data.Extraction).forEach(lien => {
            createEdge(lien); });

        // Génération de la visualisation
        network.data = {
            nodes: new vis.DataSet(nodeList),
            edges: new vis.DataSet(edgeList)
        }
    
        network.visualisation = new vis.Network(network.container,
            network.data, network.options);
    
        network.visualisation.on('afterDrawing', function() {
            // Visuation générée chargée
            network.isLoaded = true;
        });
    
        // Évent au clic sur un nœud
        network.visualisation.on('click', nodeView);
    
        // Évent au clic sur un nœud
        network.visualisation.on('hoverNode', function(params) {
            network.visualisation.selectNodes([params.node]);
        });

        // Évent au zoom
        network.visualisation.on('zoom', function(params) {

            // limiter le de-zoom
            if (params.scale <= 0.2) {
                network.visualisation.moveTo({
                    position: { x: 0, y: 0 },
                    scale: network.zoom.min
                });
            }

            // limiter le zoom
            if (params.scale >= 1) {
                network.visualisation.moveTo({ scale: network.zoom.max }); }
            
        });
    });
    
});

let nodeList = [];
function createNode(entite) {
    
    var nodeObject = {
        id: entite.id,
        label: entite.label,
        title: entite.titre,
        group: entite.relation_otlet,
        image: './assets/photos/' + entite.photo,
        size : 30,
        borderWidth: 3,
        borderWidthSelected: 60,
        margin: 20,
        metas: {
            genre: entite.genre,
            annee_naissance: entite.annee_naissance,
            annee_mort: entite.annee_mort,
            pays: entite.pays,
            discipline: entite.discipline,
            description: entite.description
        },
        interaction: {hover:true}
    };
    nodeList.push(nodeObject);
}

let edgeList = [];
function createEdge(lien) {
    var edgeObject = {
        from: lien.from,
        to: lien.to,
        title: lien.label
    };
    edgeList.push(edgeObject);
}

function chooseColor(relationEntite) {
    switch (relationEntite) {
        case 'collegue':
            return 'purple';
        case 'contemporain':
            return 'green';
        case 'collaborateur':
            return 'orange';
        case 'opposant':
            return 'red';
        case 'famille':
            return 'blue';
        case 'otlet':
            return 'gray';
        case 'institution':
            return 'gray';
        case 'œuvre':
            return 'gray';
        case 'évènement':
            return 'gray';
    }
}

function nodeView(nodeMetasBrutes) {
    
    var id = nodeMetasBrutes.nodes[0];

    if (id === undefined) {
        return; }
    
    if (network.selectedNode !== undefined && network.selectedNode == id) {
        return; }

    zoomToNode(id);

    var nodeMetas = getNodeMetas(id);

    volet.fill(nodeMetas);
    volet.open();
    
}

function getNodeMetas(id) { 
    var nodeMetas = null;

    network.data.nodes.get({

        filter: function (item) {
            if (item.id == id) {
                nodeMetas = item.metas;
                nodeMetas.label = item.label;
                nodeMetas.image = item.image;

                network.selectedNode = id;
            }
        }
    });

    return nodeMetas;
}

function zoomToNode(id) {
    // Trouver le nœud et zommer sur lui
    var nodeCoordonates = network.visualisation.getPosition(id);
    network.visualisation.moveTo({
        position: {
            x: nodeCoordonates.x,
            y: nodeCoordonates.y
        },
        scale: 1,
        animation: true
    });
    // L'activer, lui et ses liens
    network.visualisation.selectNodes([id]);
}

function backToCenterView() {
    network.visualisation.fit({
        animation: true
    });
}