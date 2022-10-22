import { Injectable } from '@angular/core';
import { CanvasService } from './canvas.service';
import { Dimension, Position } from '../interfaces/canvas.interface';

@Injectable({providedIn: 'root'})
export class ZoomService {

  private readonly SCALE_FACTOR = 1.1;
  private readonly zoomLevel = { min: 0.1, max: 10 } as const;

  private get canvas(): fabric.Canvas { return this.canvasService.canvas }

  constructor(
    private canvasService: CanvasService
  ) {  }

  fitToPage() {
    this.canvas.discardActiveObject();
    const { width: canvasWidth,  height: canvasHeight } = this.canvasService.canvasDimensions;
    const { width: displayWidth, height: displayHeight } = this.getDisplayDimensions();

    const actualWidth = this.getCanvasWidth(canvasWidth, canvasHeight,displayWidth, displayHeight);
    const actualHeight = this.getCanvasHeight(canvasWidth, canvasHeight, displayWidth, displayHeight);
    const { width, height } = this.getAdjustedDimensions(actualWidth, actualHeight, displayWidth, displayHeight);
    this.canvas.setDimensions({ width , height });
    const zoom = this.getCurrentZoomLevel();
    this.canvas.setZoom(zoom);
    this.setPosition();
    this.canvas.requestRenderAll();
    console.log('Fit to Page', this.canvas.getZoom());
  }

  zoomIn() {
    this.canvas.discardActiveObject();
    let zoom = this.canvas.getZoom();
    zoom *= this.SCALE_FACTOR;
    zoom = this.getZoomLevelLimit(zoom)
    this.setZoom(zoom);
    console.log('Zoom In', this.canvas.getZoom());
  }

  zoomOut() {
    this.canvas.discardActiveObject();
    let zoom = this.canvas.getZoom();
    zoom /= this.SCALE_FACTOR;
    zoom = this.getZoomLevelLimit(zoom)
    this.setZoom(zoom);
    console.log('Zoom Out', this.canvas.getZoom());
  }

  zoomOnMouseWheel() {
    this.canvasService.inner.addEventListener('wheel', e => {
      e.preventDefault();
      e.stopPropagation();
    });

    this.canvas.on('mouse:wheel', option => {
      const event = option.e;
      if (!event.ctrlKey) return;

      const point = option.absolutePointer!;
      const container = this.canvasService.container;
      const original = {
        left: parseFloat(getComputedStyle(container).left),
        top: parseFloat(getComputedStyle(container).top),
        width: parseFloat(getComputedStyle(container).width),
        height: parseFloat(getComputedStyle(container).height)
      }

      console.log('BEFORE', container.offsetLeft, container.offsetTop);
      const delta = event.deltaY / Math.abs(event.deltaY);
      if (delta === -1) this.zoomIn();
      if (delta === 1) this.zoomOut();
      console.log('AFTER', container.offsetLeft, container.offsetTop);

      const scaled = {
        width: parseFloat(getComputedStyle(container).width),
        height: parseFloat(getComputedStyle(container).height)
      }
      const move = {
        left: (Math.abs(scaled.width - original.width) / 2) * delta,
        top: (Math.abs(scaled.height - original.height)  / 2) * delta
      }
      const left = original.left + move.left;
      const top = original.top + move.top;
      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      event.preventDefault();
      event.stopPropagation();
    });
  }

  zoomToPercent(level: number) {
    this.setZoom(level);
    console.log('Zoom to Percent', this.canvas.getZoom());
  }


  private getZoomLevelLimit(zoom: number): number {
    const { min, max } = this.zoomLevel;
    if (zoom > max) return max;
    if (zoom < min) return min;

    return zoom;
  }

  private setZoom(zoom: number) {
    this.canvas.setZoom(zoom);
    const width = this.canvasService.canvasDimensions.width * zoom;
    const height = this.canvasService.canvasDimensions.height * zoom;
    this.canvas.setDimensions({ width, height });
    this.canvas.requestRenderAll();
  }

  private getDisplayDimensions(): Dimension {
    const wrapper = getComputedStyle(this.canvasService.wrapper);
    const actionBar = getComputedStyle(this.canvasService.actionBar);
    const width = parseFloat(wrapper.width);
    const height = parseFloat(wrapper.height) - parseFloat(actionBar.height);

    return { width, height };
  }

  private getPosition(): Position {
    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();
    const { width: displayWidth, height: displayHeight } = this.getDisplayDimensions();
    const left = (displayWidth - canvasWidth) / 2;
    const top = (displayHeight - canvasHeight) / 2;

    return { left, top };
  }

  private setPosition() {
    const { left, top } = this.getPosition();
    const container = this.canvasService.container;
    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
  }

  private getCanvasWidth(width: number, height: number, displayWidth: number, displayHeight: number): number {
    const ratio = width / Math.max(width, height);
    const actualWidth = width > displayWidth || height > displayHeight
      ? Math.min(displayWidth, displayHeight) * ratio
      : width;

    return actualWidth;
  }

  private getCanvasHeight(width: number, height: number, displayWidth: number, displayHeight: number): number {
    const ratio = height / Math.max(width, height);
    const actualHeight = width > displayWidth || height > displayHeight
      ? Math.min(displayWidth, displayHeight) * ratio
      : height;

    return actualHeight;
  }

  private getAdjustedDimensions(width: number, height: number, displayWidth: number, displayHeight: number): Dimension {
    let newHeight = displayHeight;
    let newWidth = width;
    do {
      const ratio = newHeight / height;
      newWidth = width * ratio;
      if (newWidth >= displayWidth) newHeight--;
    } while (newWidth >= displayWidth)

    return {
      width: newWidth * 0.9,
      height: newHeight * 0.9
    }
  }

  private getCurrentZoomLevel() {
    const { width: canvasWidth,  height: canvasHeight } = this.canvasService.canvasDimensions;
    const actualWidth = this.canvas.getWidth();
    const actualHeight = this.canvas.getHeight();
    const scaleWidth = actualWidth / canvasWidth;
    const scaleHeight = actualHeight / canvasHeight;

    return Math.min(scaleWidth, scaleHeight);
  }
}
