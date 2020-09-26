import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[focusNext]'
})
export class FocusNextDirective {

  constructor() { }
  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {

    if (event.key == "Enter" || event.key == "Tab"){
      event.preventDefault();
      var nextEl = this.findNextTabStop(document.activeElement);
      nextEl.focus();
    }
  }

  findNextTabStop(el) {
    var universe = document.querySelectorAll(
      "input, button, select, textarea, a[href]"
    );
    var list = Array.prototype.filter.call(universe, function(item) {
      return item.tabIndex >= "0";
    });
    var index = list.indexOf(el);
    return list[index + 1] || list[0];
  }

}
