import { Injectable } from '@angular/core';
import { CanvasService } from './canvas.service';

@Injectable({providedIn: 'root'})
export class PanService {

  private isDragging = false;
  private selection = false;
  private lastPosX = 0;
  private lastPosY = 0;
  private left = 0;
  private top = 0;

  private get canvas() { return this.canvasService.canvas }

  constructor(
    private canvasService: CanvasService
  ) { }

  onPan() {
    this.onMouseDown();
    this.onMouseMove();
    this.onMouseUp();
  }

  private onMouseDown() {
    const container = this.canvasService.container;
    this.canvas.on('mouse:down', option => {
      const event = option.e;
      if (!event.altKey) return;

      this.canvas.setCursor('grab');
      this.isDragging = true;
      this.selection = this.canvas.selection || false;
      this.lastPosX = event.clientX;
      this.lastPosY = event.clientY;
      this.left = parseFloat(getComputedStyle(container).left);
      this.top = parseFloat(getComputedStyle(container).top);
      event.preventDefault();
      event.stopPropagation();
    });
  }

  private onMouseMove() {
    const container = this.canvasService.container;
    this.canvas.on('mouse:move', option => {
      const event = option.e;
      if (!event.altKey) return;
      if (!this.isDragging) return;

      this.canvas.setCursor('grabbing');
      const left = this.left + (event.clientX - this.lastPosX);
      const top = this.top + (event.clientY - this.lastPosY);
      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      event.preventDefault();
      event.stopPropagation();
    });
  }

  private onMouseUp() {
    this.canvas.on('mouse:up', option => {
      const event = option.e;
      this.isDragging = false;
      this.canvas.selection = this.selection;
      this.canvas.setCursor('default');
      event.preventDefault();
      event.stopPropagation();
    });
  }
}
