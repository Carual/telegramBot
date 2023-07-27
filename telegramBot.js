const axios = require('axios')
const URL = 'https://api.telegram.org/bot'
class telegramBot {
	constructor(token) {
		this.token = token
	}
	async request(method, data) {
		for (let key in data) {
			data[key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)] = data[key]
		}
		let res = (
			await axios({
				url: `${URL}${this.token}/${method}`,
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				data,
				validateStatus: () => true,
			})
		).data
		if (!res.ok) throw new Error(`Telegram error ${res.error_code} ${res.description}`)
		return res.result
	}
	getMe() {
		return this.request('getMe')
	}
	sendMessage(chatId, message, options = {}) {
		return this.request('sendMessage', {
			chat_id: chatId,
			text: message,
			...options,
		})
	}
	setWebhook(url, secretToken) {
		return this.request('setWebhook', {
			url,
			secretToken,
		})
	}
	getWebhookInfo() {
		return this.request('getWebhookInfo')
	}
	deleteWebhook(dropPendingUpdates = false) {
		return this.request('deleteWebhook', {
			drop_pending_updates: dropPendingUpdates,
		})
	}
	getUpdates(offset = 0, limit = 100, timeout = 0) {
		return this.request('getUpdates', {
			offset,
			limit,
			timeout,
		})
	}
	getMyDescription() {
		return this.request('getMyDescription')
	}
	getMyCommands(scope) {
		return this.request('getMyCommands', {
			scope,
		})
	}
}
module.exports = telegramBot
