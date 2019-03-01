defmodule ChatWeb.PrivateChannel do
    use ChatWeb, :channel
    require Logger
    
    alias ChatWeb.Presence
    alias Chat.Repo
    alias Chat.Auth.User
    
    def join("private:" <> user_id, _message, socket) do
        {:ok, %{channel: "private:#{user_id}"}, assign(socket, :user_id, user_id)}
    end
    
    def handle_in("offer", %{"message" => message, "peer" => peer, "init" => init, "recipient" => recipient, "sender" => sender}, socket) do
      Logger.info "THAT"
      socket.endpoint.broadcast!("private:#{recipient}" , "offer" , %{message: message, peer: peer, init: init, sender: sender, recipient: recipient})
      {:noreply, socket}
    end

    def handle_in("answer", %{"message" => message, "peer" => peer, "recipient" => recipient, "sender" => sender}, socket) do
      Logger.info "THAT too"
      socket.endpoint.broadcast!("private:#{sender}" , "answer" , %{message: message, peer: peer, recipient: recipient, sender: sender})
      {:noreply, socket}
    end
    
    def handle_in("ice_offer", %{"message" => message, "peer" => peer, "init" => init, "recipient" => recipient, "sender" => sender}, socket) do
      Logger.info "THAT too"
      socket.endpoint.broadcast!("private:#{recipient}" , "ice_offer" , %{message: message, peer: peer, init: init, sender: sender, recipient: recipient})
      {:noreply, socket}
    end

    def handle_in("ice_answer", %{"message" => message, "peer" => peer, "recipient" => recipient, "sender" => sender}, socket) do
      Logger.info "THAT too"
      socket.endpoint.broadcast!("private:#{sender}" , "ice_answer" , %{message: message, peer: peer, sender: recipient, recipient: sender})
      {:noreply, socket}
    end
    
  end