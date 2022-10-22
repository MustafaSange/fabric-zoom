import { Injectable } from '@angular/core';
import { fabric } from 'fabric';

@Injectable({providedIn: 'root'})
export class CanvasService {

  private _canvas!: fabric.Canvas;
  private _wrapper!: HTMLDivElement;
  private _container!: HTMLDivElement;
  private _inner!: HTMLDivElement;
  private _actionBar!: HTMLDivElement;
  private readonly _canvasDimensions = { width: 400, height: 400 } as const;

  get canvas(): fabric.Canvas { return this._canvas }
  get wrapper(): HTMLDivElement { return this._wrapper }
  get inner(): HTMLDivElement { return this._inner }
  get container(): HTMLDivElement { return this._container }
  get actionBar(): HTMLDivElement { return this._actionBar }
  get canvasAll() { return this.wrapper.querySelectorAll('canvas') };
  get canvasDimensions() { return this._canvasDimensions };

  init(canvas: HTMLCanvasElement) {
    this._canvas = new fabric.Canvas(canvas);
    const { width, height } = this.canvasDimensions;
    this.canvas.setDimensions({ width, height });
    this.setElementRef(canvas);
    this.setElementProperties();
    this.addText();
  }

  private setElementRef(canvas: HTMLCanvasElement) {
    this._wrapper = canvas.closest('.wrapper') as HTMLDivElement;
    this._container = this.wrapper.querySelector('.canvas-container') as HTMLDivElement;
    this._actionBar = this.wrapper.querySelector('.action-bar') as HTMLDivElement;
    this._inner = this.wrapper.querySelector('.inner') as HTMLDivElement;
  }

  private setElementProperties() {
    this.container.style.border = '2px solid limegreen';
    this.container.style.display = 'inline-block';
    this.canvasAll.forEach(canvas => canvas.style.border = '1px solid red');
  }

  private addText() {
    const text = new fabric.Textbox('Hello Aaminah', {
      width: 200,
      fontSize: 24,
      fontFamily: 'Poppins',
      textAlign: 'center',
      centeredRotation: true,
    });
    this.canvas.add(text);
    text.viewportCenter();
    text.setCoords();
    this.canvas.requestRenderAll();
  }
}
