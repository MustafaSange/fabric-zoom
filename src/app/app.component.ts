import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CanvasService } from './services/canvas.service';
import { PanService } from './services/pan.service';
import { ZoomService } from './services/zoom.service';

// http://jsfiddle.net/dudih/y0z33gym/1/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('canvas', { static: true, read: ElementRef<HTMLCanvasElement>}) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private canvasService: CanvasService,
    private zoomService: ZoomService,
    private panService: PanService
  ) { }

  ngOnInit(): void {
    this.canvasService.init(this.canvasRef.nativeElement);
    this.zoomService.fitToPage();
    this.zoomService.zoomOnMouseWheel();
    this.panService.onPan();
  }

  protected fitToPage() {
    this.zoomService.fitToPage();
  }

  protected zoomIn() {
    this.zoomService.zoomIn();
  }

  protected zoomOut() {
    this.zoomService.zoomOut();
  }

  protected zoomToPercent(level: number) {
    this.zoomService.zoomToPercent(level);
  }
}


/*
private wrapper!: HTMLDivElement;
  private actionBar!: HTMLDivElement;
  private inner!: HTMLDivElement;
  private container!: HTMLDivElement;
  private canvas!: fabric.Canvas;
  private readonly canvasWidth = 500;
  private readonly canvasHeight = 500;
  @ViewChild('canvas', { static: true, read: ElementRef<HTMLCanvasElement> }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    const canvasEl = this.canvasRef.nativeElement;
    this.canvas = new fabric.Canvas(canvasEl);
    this.canvas.setDimensions({ width: this.canvasWidth, height: this.canvasHeight });
    this.container = canvasEl.closest('.canvas-container') as HTMLDivElement;
    this.container.style.border = '2px solid limegreen';
    this.container.style.display = 'inline-block';
    this.wrapper = this.container.closest('.wrapper') as HTMLDivElement;
    this.inner = this.wrapper.querySelector('inner') as HTMLDivElement;
    this.actionBar = this.wrapper.querySelector('.action-bar') as HTMLDivElement;

    this.wrapper.querySelectorAll('canvas').forEach(canvas => canvas.style.border = '1px solid red');

    this.setContainerDimensions();

    this.onZoom();
    this.onPan();

    this.addText();
    console.log(this.canvas.viewportTransform);
  }

  protected zoomIn() {
    const SCALE_FACTOR = 1.1;
    let zoom = this.canvas.getZoom();
    zoom *= SCALE_FACTOR;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.setZoom(this.canvas.getZoom() * SCALE_FACTOR);
    this.canvas.setWidth(this.canvas.getWidth() * SCALE_FACTOR);
    this.canvas.setHeight(this.canvas.getHeight() * SCALE_FACTOR);
    const position = {
      left: parseFloat(this.container.style.left),
      top: parseFloat(this.container.style.top)
    }
    const diff = {
      left: position.left - ((position.left * SCALE_FACTOR) - position.left),
      top: position.top - ((position.top * SCALE_FACTOR) - position.top),
    }
    console.log(diff);
    this.container.style.left = `${diff.left}px`;
    this.container.style.top = `${diff.top}px`;
    this.canvas.requestRenderAll();
    console.log(this.canvas.viewportTransform);
  }

  protected zoomOut() {
    const SCALE_FACTOR = 1.1;
    let zoom = this.canvas.getZoom();
    zoom *= SCALE_FACTOR;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    this.canvas.setZoom(this.canvas.getZoom() / SCALE_FACTOR);
    this.canvas.setWidth(this.canvas.getWidth() / SCALE_FACTOR);
    this.canvas.setHeight(this.canvas.getHeight() / SCALE_FACTOR);
    this.canvas.requestRenderAll();
    console.log(this.canvas.viewportTransform);
  }

  protected fitToPage() {
    this.canvas.setZoom(1);
    this.canvas.setWidth(this.canvasWidth);
    this.canvas.setHeight(this.canvasHeight);
    this.canvas.requestRenderAll();
    this.setContainerDimensions();
  }

  private addText() {
    const text = new fabric.Textbox('Hello', { fontFamily: 'Poppins', fontSize: 36 });
    this.canvas.add(text);
    text.width = 150;
    text.textAlign = 'center';
    text.viewportCenter();
    text.setCoords();
    this.canvas.setActiveObject(text);
    this.canvas.requestRenderAll();
  }

  private onZoom() {
    this.canvas.on('mouse:wheel', option => {
      var delta = option.e.deltaY;
      var zoom = this.canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.canvas.zoomToPoint({ x: option.e.offsetX, y: option.e.offsetY }, zoom);
      option.e.preventDefault();
      option.e.stopPropagation();
      this.setContainerDimensions();
      console.log(this.canvas.viewportTransform);
    });
  }

  private onPan() {
    let isDragging = false;
    let selection = false;
    let lastPosX = 0;
    let lastPosY = 0;

    this.canvas.on('mouse:down', option => {
      var event = option.e;
      if (event.altKey === true) {
        isDragging = true;
        selection = this.canvas.selection || false;
        this.canvas.selection = false;
        lastPosX = event.clientX;
        lastPosY = event.clientY;
      }
    });

    this.canvas.on('mouse:move', option => {
      if (isDragging) {
        var e = option.e;
        var vpt = this.canvas.viewportTransform!;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        this.canvas.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });

    this.canvas.on('mouse:up', option => {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      this.canvas.setViewportTransform(this.canvas.viewportTransform!);
      isDragging = false;
      this.canvas.selection = selection;
    });
  }

  private setContainerDimensions() {
    const canvas = { width: this.canvas.getWidth(), height: this.canvas.getHeight() };
    const display = this.getDisplayDimensions();
    const zoom = this.canvas.getZoom();

    const containerWidth = canvas.width * zoom;
    const containerHeight = canvas.height * zoom;

    const left = (display.width - containerWidth) / 2;
    const top = (display.height - containerHeight) / 2;

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
    this.container.style.width = `${containerWidth}px`;
    this.container.style.height = `${containerHeight}px`;

    this.wrapper.querySelectorAll('canvas').forEach(canvas => {
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;
    });
  }

  private getDisplayDimensions(): { width: number, height: number } {
    const wrapper = getComputedStyle(this.wrapper);
    const actionBar = getComputedStyle(this.actionBar);
    const width = parseFloat(wrapper.width);
    const height = parseFloat(wrapper.height) - parseFloat(actionBar.height);

    return { width, height };
  }
  */
