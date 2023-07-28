const axios = require('axios')
const URL = 'https://api.telegram.org/bot'
class telegramBot {
	constructor(token, config = {}) {
		this.token = token
		this.config = config
		this.onMessage = []
		this.onCommand = []
		this.lastUpdate = 0
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
	async getUpdates(offset = 0, limit = 100, timeout = 0) {
		let updates = await this.request('getUpdates', {
			offset,
			limit,
			timeout,
		})
		for (let update of updates) {
			this.processUpdate(update)
		}
		return updates
	}
	getMyDescription() {
		return this.request('getMyDescription')
	}
	getMyCommands(scope) {
		return this.request('getMyCommands', {
			scope,
		})
	}
	processUpdate(updateObj) {
		if (updateObj.update_id <= this.lastUpdate) return console.log('WARNING: update already processed')
		this.lastUpdate = updateObj.update_id
		if (updateObj.message) {
			this.onMessage.forEach(func => {
				func(updateObj.message)
			})
		}
		if (updateObj.message && updateObj.message.text && updateObj.message.text.startsWith('/')) {
			this.onCommand.forEach(func => {
				let args = updateObj.message.text.split(' ')
				let command = args.splice(0, 1)
				func(command, updateObj.message, ...args)
			})
		}
	}
	on(event, func) {
		switch (event) {
			case 'message':
				this.onMessage.push(func)
				break
			case 'command':
				this.onCommand.push(func)
				break
			default:
				throw new Error(`Event ${event} not found`)
		}
	}
}
module.exports = telegramBot
