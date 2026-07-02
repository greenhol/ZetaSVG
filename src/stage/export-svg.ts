export interface ExportData {
    filename: string;
    title: string;
    creator: string;
    date: string;
    config: object;
}

export namespace ExportSvg {

    export function exportSvg(exportData: ExportData, svg: SVGElement, removeClasses: string[]) {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        if (!clone.getAttribute('width') || !clone.getAttribute('height')) {
            const bbox = svg.getBoundingClientRect();
            clone.setAttribute('width', String(bbox.width));
            clone.setAttribute('height', String(bbox.height));
        }
        clone.insertBefore(buildMetadata(exportData), clone.firstChild);

        removeClasses.forEach(removeClass => clone.querySelectorAll(`.${removeClass}`).forEach(el => el.remove()));

        const svgString = new XMLSerializer().serializeToString(clone);
        const blob = new Blob(
            ['<?xml version="1.0" standalone="no"?>\r\n', svgString],
            { type: "image/svg+xml;charset=utf-8" }
        );

        const finalFilename = exportData.filename.endsWith('.svg') ? exportData.filename : `${exportData.filename}.svg`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 0);
    }

    function buildMetadata(exportData: ExportData): SVGMetadataElement {
        const svgNS = 'http://www.w3.org/2000/svg';
        const rdfNS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
        const dcNS = 'http://purl.org/dc/elements/1.1/';
        const ccNS = 'http://creativecommons.org/ns#';
        const appNS = 'https://github.com/greenhol/ZetaSVG';

        const metadata = document.createElementNS(svgNS, 'metadata');

        const rdf = document.createElementNS(rdfNS, 'rdf:RDF');
        rdf.setAttribute('xmlns:rdf', rdfNS);
        rdf.setAttribute('xmlns:dc', dcNS);
        rdf.setAttribute('xmlns:cc', ccNS);

        const work = document.createElementNS(ccNS, 'cc:Work');

        const titleEl = document.createElementNS(dcNS, 'dc:title');
        titleEl.textContent = exportData.title;

        const creatorEl = document.createElementNS(dcNS, 'dc:creator');
        const agentEl = document.createElementNS(ccNS, 'cc:Agent');
        const agentTitleEl = document.createElementNS(dcNS, 'dc:title');
        agentTitleEl.textContent = exportData.creator;
        agentEl.appendChild(agentTitleEl);
        creatorEl.appendChild(agentEl);

        const dateEl = document.createElementNS(dcNS, 'dc:date');
        dateEl.textContent = exportData.date;

        work.append(titleEl, creatorEl, dateEl);
        rdf.appendChild(work);
        metadata.appendChild(rdf);

        const configEl = document.createElementNS(appNS, 'app:config');
        configEl.setAttribute('xmlns:app', appNS);
        configEl.textContent = JSON.stringify(exportData.config);
        metadata.appendChild(configEl);

        return metadata;
    }
}