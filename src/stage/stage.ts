import { BaseType, select, Selection } from 'd3';
import { Circle } from '../types/shape/circle';
import { Group, GroupChild, SortBy } from '../types/shape/group';
import { Path } from '../types/shape/path';
import { Rectangle } from '../types/shape/rectangle';
import { ShapeType } from '../types/shape/shape';
import { Collection, Shapes } from '../types/shape/shapes';
import { Text } from '../types/shape/text';
import { SerialSubscriptions } from '../utils/serial-subscriptions';

const SVG_TYPE_GROUP = 'g';
const SVG_TYPE_CIRCLE = 'circle';
const SVG_TYPE_PATH = 'path';
const SVG_TYPE_TEXT = 'text';
const SVG_CLASS_INIVISIBLE = 'svg-shape--invisible';

export class Stage {

    private _width: number;
    private _height: number;
    // private svgg: Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private _svgg: Selection<SVGGElement, unknown, HTMLElement, any>;

    private _subscriptions = new SerialSubscriptions();
    private _created: Set<string> = new Set();

    constructor(divId: string) {

        const elem = document.getElementById(divId);
        this._width = elem?.clientWidth ? elem.clientWidth : 0;
        this._height = elem?.clientHeight ? elem.clientHeight : 0;

        this.addSvgCss();

        this._svgg = select(`#${divId}`)
            .append('svg')
            .attr('id', 'svgMain')
            .attr('width', this._width)
            .attr('height', this._height)
            .append('g')
            .attr('transform', 'translate(.5, .5)');
    }

    registerShapes(shapes: Shapes, backgroundColor: string) {
        select(`svg#svgMain`)
            .style('background', backgroundColor);

        this._subscriptions.set(shapes.id, shapes.collection$.subscribe((update) => {
            this._created.has(shapes.id)
                ? this.updateShapes(shapes.id, update)
                : this.createShapes(shapes.id, update);
        }));
    }

    unregisterShapes(id: string) {
        this.removeShapes(id);
        this._subscriptions.unsubscribe(id);
        this._created.delete(id);
    }

    private addSvgCss() {
        var sheet = window.document.styleSheets[0];
        sheet.insertRule(`.${SVG_CLASS_INIVISIBLE} { visibility: hidden;}`, sheet.cssRules.length);
    }

    private createShapes(id: string, collection: Collection) {
        console.log('#createShapes', { id, collection });
        this.createGroups(id, collection.groups);
        this.createCircles(id, collection.circles);
        this.createPaths(id, collection.paths);
        this.createRectangles(id, collection.rectangles);
        this.createTexts(id, collection.texts);

        this.updateShapes(id, collection);
        this._created.add(id);
    }

    private updateShapes(id: string, collection: Collection) {
        // console.trace('#updateShapes', id);
        this.updateGroups(id, collection.groups);
        this.updateCircles(id, collection.circles);
        this.updatePaths(id, collection.paths);
        this.updateRectangles(id, collection.rectangles);
        this.updateTexts(id, collection.texts);
        this.sortAllShapesByDistance(id);
    }

    // Groups
    private createGroups(id: string, groups: Group[]) {
        console.log(`#createGroups - id=${id}, cnt=${groups.length}`);
        this._svgg.selectAll<BaseType, Group>(`${SVG_TYPE_GROUP}.${ShapeType.GROUP}.${id}`)
            .data(groups, (d: Group) => d.id)
            .enter()
            .append(SVG_TYPE_GROUP)
            .attr('id', (d: Group) => d.id)
            .classed(ShapeType.GROUP, true)
            .classed(id, true);

        groups.forEach((group: Group) => {
            const svggg = this._svgg.select(`#${group.id}`);
            this.createCirclesForGroup(
                svggg,
                group.id,
                group.children
                    .filter((child: GroupChild) => child.child.type == ShapeType.CIRCLE)
                    .map((child: GroupChild) => child.child as Circle),
            );
            this.createPathsForGroup(
                svggg,
                group.id,
                group.children
                    .filter((child: GroupChild) => child.child.type == ShapeType.PATH)
                    .map((child: GroupChild) => child.child as Path)
            )

            switch (group.attr.sortBy) {
                case SortBy.DISTANCE: this.sortAllShapesByDistance(group.id); break;
                case SortBy.INDEX: this.sortAllGroupChildsByIndex(svggg, group.id); break;
            }
        });
    }

    private updateGroups(id: string, groups: Group[]) {
        this._svgg.selectAll<BaseType, Group>(`${SVG_TYPE_GROUP}.${ShapeType.GROUP}.${id}`)
            .data(groups, (d: Group) => d.id)
            .classed(SVG_CLASS_INIVISIBLE, (d: Group) => d.isHidden());

        groups.forEach((group: Group) => {
            const svggg = this._svgg.select(`#${group.id}`);
            this.updateCirclesForGroup(
                svggg,
                group.id,
                group.children
                    .filter((child: GroupChild) => child.child.type == ShapeType.CIRCLE)
                    .map((child: GroupChild) => child.child as Circle),
            );
            this.updatePathsForGroup(
                svggg,
                group.id,
                group.children
                    .filter((child: GroupChild) => child.child.type == ShapeType.PATH)
                    .map((child: GroupChild) => child.child as Path)
            )

            switch (group.attr.sortBy) {
                case SortBy.DISTANCE: this.sortAllShapesByDistance(group.id); break;
                case SortBy.INDEX: this.sortAllGroupChildsByIndex(svggg, group.id); break;
            }
        });
    }

    // Circles
    private createCircles(id: string, circles: Circle[]) {
        console.log(`#createCircles - id=${id}, cnt=${circles.length}`);
        this._svgg.selectAll<BaseType, Circle>(`${SVG_TYPE_CIRCLE}.${ShapeType.CIRCLE}.${id}`)
            .data(circles, (d: Circle) => d.id)
            .enter()
            .append(SVG_TYPE_CIRCLE)
            .attr('id', (d: Circle) => d.id)
            .classed(ShapeType.CIRCLE, true)
            .classed(id, true);
    }

    private createCirclesForGroup(svggg: Selection<BaseType, unknown, HTMLElement, any>, id: string, circles: Circle[]) {
        // console.log(`#createCirclesForGroup - id=${id}, cnt=${circles.length}`);
        svggg.selectAll<BaseType, Circle>(`${SVG_TYPE_CIRCLE}.${ShapeType.CIRCLE}.${id}`)
            .data(circles, (d: Circle) => d.id)
            .enter()
            .append(SVG_TYPE_CIRCLE)
            .attr('id', (d: Circle) => d.id)
            .classed(ShapeType.CIRCLE, true)
            .classed(id, true);
    }

    private updateCircles(id: string, circles: Circle[]) {
        this.setCircleAttributes(
            this._svgg.selectAll<BaseType, Circle>(`${SVG_TYPE_CIRCLE}.${ShapeType.CIRCLE}.${id}`)
                .data(circles, (d: Circle) => d.id)
                .classed(SVG_CLASS_INIVISIBLE, (d: Circle) => d.isHidden())
        );
    }

    private updateCirclesForGroup(svggg: Selection<BaseType, unknown, HTMLElement, any>, id: string, circles: Circle[]) {
        this.setCircleAttributes(
            svggg.selectAll(`${SVG_TYPE_CIRCLE}.${ShapeType.CIRCLE}.${id}`)
                .data(circles)
                .classed(SVG_CLASS_INIVISIBLE, (d: Circle) => d.isHidden())
        );
    }

    private setCircleAttributes(selection: Selection<BaseType, Circle, BaseType, unknown>) {
        selection
            .style('stroke-width', (d: Circle) => d.style.strokeWidth)
            .style('stroke', (d: Circle) => d.style.stroke)
            .style('stroke-opacity', (d: Circle) => d.style.strokeOpacity)
            .style('fill', (d: Circle) => d.style.fill)
            .style('fill-opacity', (d: Circle) => d.style.fillOpacity)
            .attr('cx', (d: Circle) => d.attr.cx)
            .attr('cy', (d: Circle) => d.attr.cy)
            .attr('r', (d: Circle) => d.attr.r);
    }

    // Paths
    private createPaths(id: string, paths: Path[]) {
        console.log(`#createPaths - id=${id}, cnt=${paths.length}`);
        this._svgg.selectAll<SVGPathElement, Path>(`${SVG_TYPE_PATH}.${ShapeType.PATH}.${id}`)
            .data(paths, (d: Path) => d.id)
            .enter()
            .append(SVG_TYPE_PATH)
            .attr('id', (d: Path) => d.id)
            .classed(ShapeType.PATH, true)
            .classed(id, true)
            .style('stroke-linejoin', 'round')
            .style('fill', 'none');
    }

    private createPathsForGroup(svggg: Selection<BaseType, unknown, HTMLElement, any>, id: string, paths: Path[]) {
        // console.log(`#createPathForGroup - id=${id}, cnt=${paths.length}`);
        svggg.selectAll<SVGPathElement, Path>(`${SVG_TYPE_PATH}.${ShapeType.PATH}.${id}`)
            .data(paths, (d: Path) => d.id)
            .enter()
            .append(SVG_TYPE_PATH)
            .attr('id', (d: Path) => d.id)
            .classed(ShapeType.PATH, true)
            .classed(id, true)
            .style('fill', 'none');
    }

    private updatePaths(id: string, paths: Path[]) {
        this.setPathAttributes(
            this._svgg.selectAll<SVGPathElement, Path>(`${SVG_TYPE_PATH}.${ShapeType.PATH}.${id}`)
                .data(paths, (d: Path) => d.id)
                .classed(SVG_CLASS_INIVISIBLE, (d: Path) => d.isHidden())
        );
    }

    private updatePathsForGroup(svggg: Selection<BaseType, unknown, HTMLElement, any>, id: string, paths: Path[]) {
        this.setPathAttributes(
            svggg.selectAll<SVGPathElement, Path>(`${SVG_TYPE_PATH}.${ShapeType.PATH}.${id}`)
                .data(paths, (d: Path) => d.id)
                .classed(SVG_CLASS_INIVISIBLE, (d: Path) => d.isHidden())
        );
    }

    private setPathAttributes(selection: Selection<SVGPathElement, Path, BaseType, unknown>) {
        selection
            .style('stroke-width', (d: Path) => d.style.strokeWidth)
            .style('stroke', (d: Path) => d.style.stroke)
            .style('stroke-opacity', (d: Path) => d.style.strokeOpacity)
            .style('stroke-linecap', (d: Path) => d.style.strokeLinecap)
            .style('stroke-linejoin', (d: Path) => d.style.strokeLinejoin)
            .attr('d', (d: Path) => d.attr.d);
    }

    // Rectangles
    private createRectangles(id: string, rectangles: Rectangle[]) {
        console.log(`#createRectangles - id=${id}, cnt=${rectangles.length}`);
        this._svgg.selectAll<SVGPathElement, Rectangle>(`${SVG_TYPE_PATH}.${ShapeType.RECTANGLE}.${id}`)
            .data(rectangles, (d: Rectangle) => d.id)
            .enter()
            .append(SVG_TYPE_PATH)
            .attr('id', (d: Rectangle) => d.id)
            .classed(ShapeType.RECTANGLE, true)
            .classed(id, true);
    }

    private updateRectangles(id: string, rectangles: Rectangle[]) {
        this.setRectangleAttributes(
            this._svgg.selectAll<SVGPathElement, Rectangle>(`${SVG_TYPE_PATH}.${ShapeType.RECTANGLE}.${id}`)
                .data(rectangles, (d: Rectangle) => d.id)
                .classed(SVG_CLASS_INIVISIBLE, (d: Rectangle) => d.isHidden())
        );
    }

    private setRectangleAttributes(selection: Selection<SVGPathElement, Rectangle, SVGGElement, unknown>) {
        selection
            .style('stroke-width', (d: Rectangle) => d.style.strokeWidth)
            .style('stroke', (d: Rectangle) => d.style.stroke)
            .style('stroke-opacity', (d: Rectangle) => d.style.strokeOpacity)
            .style('stroke-linejoin', (d: Rectangle) => d.style.strokeLinejoin)
            .style('fill', (d: Rectangle) => d.style.fill)
            .style('fill-opacity', (d: Rectangle) => d.style.fillOpacity)
            .attr('d', (d: Rectangle) => d.attr.d);
    }

    // Texts
    private createTexts(id: string, texts: Text[]) {
        console.log(`#createTexts - id=${id}, cnt=${texts.length}`);
        this._svgg.selectAll<SVGTextElement, Text>(`${SVG_TYPE_TEXT}.${ShapeType.TEXT}.${id}`)
            .data(texts, (d: Text) => d.id)
            .enter()
            .append(SVG_TYPE_TEXT)
            .attr('id', (d: Text) => d.id)
            .classed(ShapeType.TEXT, true)
            .classed(id, true);
    }

    private updateTexts(id: string, texts: Text[]) {
        this.setTextAttributes(
            this._svgg.selectAll<SVGTextElement, Text>(`${SVG_TYPE_TEXT}.${ShapeType.TEXT}.${id}`)
                .data(texts, (d: Text) => d.id)
                .classed(SVG_CLASS_INIVISIBLE, (d: Text) => d.isHidden())
                .classed(ShapeType.TEXT, true)
        );
    }

    private setTextAttributes(selection: Selection<SVGTextElement, Text, SVGGElement, unknown>) {
        selection
            .style('font-size', (d: Text) => d.style.fontSize)
            .style('font-family', (d: Text) => d.style.fontFamily)
            .style('fill', (d: Text) => d.style.fill)
            .style('fillOpacity', (d: Text) => d.style.fillOpacity)
            .style('alignment-baseline', (d: Text) => d.style.alignmentBaseline)
            .attr('x', (d: Text) => d.attr.x)
            .attr('y', (d: Text) => d.attr.y)
            .text((d: Text) => d.attr.text);
    }

    private sortAllShapesByDistance(id: string) {
        this._svgg.selectAll(`.${id}`).sort((a: any, b: any) => {
            // console.log(`#sortAllShapesByDistance - a.type=${a.type} a.dist=${a.dist} b.type=${b.type} b.dist=${b.dist}`);
            return b.dist - a.dist;
        });
    }

    private sortAllGroupChildsByIndex(svggg: Selection<BaseType, unknown, HTMLElement, any>, id: string) {
        svggg.selectAll(`.${id}`).sort((a: any, b: any) => a.index - b.index);
    }

    private removeShapes(id: string) {
        this._svgg.selectAll(`.${id}`).remove();
    }
}