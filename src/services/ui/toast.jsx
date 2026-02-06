  /**
   * 
   * @param {object} toast {show, header, body, variant, confirmacao}
   * @param {function} setter função de setState do toast
   */
  export const setToast = (toast, setter) => {
    setter({
      show: true,
      header: "",
      body: "",
      variant: "success",
      confirmacao: false,
      onConfirm: ()=>console.error("onConfirm not set"),
      onCancel: ()=>console.error("onCancel not set"),
      ...toast,
    })
  };
