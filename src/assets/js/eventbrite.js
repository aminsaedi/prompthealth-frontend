function registerEvent(eventId, action) {
  const button = document.createElement("button");
  button.setAttribute("id", "example-widget-trigger");
  button.setAttribute("type", "button");
  document.body.appendChild(button);
  button.style.display = "none";
  setTimeout(() => {
    document.body.removeChild(button);
  }, 200);

  window.EBWidgets.createWidget({
    widgetType: "checkout",
    eventId: eventId,
    modal: true,
    modalTriggerElementId: "example-widget-trigger",
    onOrderComplete: action,
  });

  button.click();
}