define(["require", "css!./emby-progressring", "registerElement"], function(require) {
    "use strict";
    var EmbyProgressRing = Object.create(HTMLDivElement.prototype);
    return EmbyProgressRing.createdCallback = function() {
        this.classList.add("progressring");
        var instance = this;
        require(["text!./emby-progressring.template.html"], function(template) {
            instance.innerHTML = template, instance.setProgress(parseFloat(instance.getAttribute("data-progress") || "0"))
        })
    }, EmbyProgressRing.setProgress = function(progress) {
        progress = Math.floor(progress);
        var angle;
        progress < 25 ? (angle = progress / 100 * 360 - 90, this.querySelector(".animate-0-25-b").style.transform = "rotate(" + angle + "deg)", this.querySelector(".animate-25-50-b").style.transform = "rotate(-90deg)", this.querySelector(".animate-50-75-b").style.transform = "rotate(-90deg)", this.querySelector(".animate-75-100-b").style.transform = "rotate(-90deg)") : progress >= 25 && progress < 50 ? (angle = (progress - 25) / 100 * 360 - 90, this.querySelector(".animate-0-25-b").style.transform = "none", this.querySelector(".animate-25-50-b").style.transform = "rotate(" + angle + "deg)", this.querySelector(".animate-50-75-b").style.transform = "rotate(-90deg)", this.querySelector(".animate-75-100-b").style.transform = "rotate(-90deg)") : progress >= 50 && progress < 75 ? (angle = (progress - 50) / 100 * 360 - 90, this.querySelector(".animate-0-25-b").style.transform = "none", this.querySelector(".animate-25-50-b").style.transform = "none", this.querySelector(".animate-50-75-b").style.transform = "rotate(" + angle + "deg)", this.querySelector(".animate-75-100-b").style.transform = "rotate(-90deg)") : progress >= 75 && progress <= 100 && (angle = (progress - 75) / 100 * 360 - 90, this.querySelector(".animate-0-25-b").style.transform = "none", this.querySelector(".animate-25-50-b").style.transform = "none", this.querySelector(".animate-50-75-b").style.transform = "none", this.querySelector(".animate-75-100-b").style.transform = "rotate(" + angle + "deg)"), this.querySelector(".progressring-text").innerHTML = progress + "%"
    }, EmbyProgressRing.attachedCallback = function() {}, EmbyProgressRing.detachedCallback = function() {
        var observer = this.observer;
        observer && (observer.disconnect(), this.observer = null)
    }, document.registerElement("emby-progressring", {
        prototype: EmbyProgressRing,
        extends: "div"
    }), EmbyProgressRing
});