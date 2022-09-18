// packages
import puppeteer from 'puppeteer'
import axios from 'axios'

// utilities
import { formatOpeningHours, OpeningHourType } from './timeUtils'

// get config
import * as config from '../config/config'
const { GOOGLE_API_KEY } = config

type PlaceIdType = string

/**
 * get placeid from google map page
 */
const getPlaceId = async (placeName: string): Promise<PlaceIdType | boolean> => {
	// browser context
	const browser = await puppeteer.launch({
		headless: true,
	})

	// page setting
	const page = await browser.newPage()
	await page.setViewport({
		width: 1280,
		height: 720,
	})

	// open google map page
	await page.goto(`https://www.google.com/search?q=${placeName}`, {
		waitUntil: 'networkidle0',
	})

	// load selector
	await page.waitForSelector('#wrkpb')

	// eval page code
	const placeId = await page.evaluate(() => {
		// check elem
		const reviewBtn = document.querySelector('#wrkpb')
		if (reviewBtn instanceof HTMLElement) {
			// return place id
			return reviewBtn.dataset.pid
		}
		return false
	})

	// close browser
	browser.close()

	// return placeid
	if (typeof placeId === 'undefined') return false
	return placeId
}

type PlaceInfoType = {
	success: boolean
	message: string
	data?: object
}

/**
 * get place detail info (Google Place API)
 */
const getPlaceInfo = async (placeId: string): Promise<PlaceInfoType> => {
	// response data fields
	const responseData = [
		'address_components',
		'business_status',
		'formatted_address',
		'geometry',
		'international_phone_number',
		'name',
		'opening_hours',
		'place_id',
		'rating',
		'website',
	]

	// axios request config
	const config = {
		method: 'get',
		url: `https://maps.googleapis.com/maps/api/place/details/json?fields=${responseData.join(
			','
		)}&place_id=${placeId}&language=ko&key=${GOOGLE_API_KEY}`,
		headers: {},
	}

	// request place info
	const {
		data: { result, status, error_message },
	} = await axios(config)

	// check result
	if (status !== 'OK') {
		return {
			success: false,
			message: error_message,
		}
	}

	// return data
	return {
		success: true,
		message: '',
		data: result,
	}
}

type PlaceDataType = {
	geometry: {
		lat: string
		lng: string
		zoom?: string
	}
	name: string
	desc?: string
	address: {
		global?: string
		long?: string
	}
	businessStatus?: 'OPEN' | 'OPEN_24H' | 'CLOSED' | 'CLOSED_TMP' | 'CLOSED_PERM'
	openingHours?: Array<string>
	website?: string
	phone: {
		short?: string
		long?: string
	}
}

type FormattedPlaceDataType = {
	geometry: {
		lat: string
		lng: string
		zoom?: string
	}
	name: string
	desc?: string
	address: {
		global?: string
		long?: string
	}
	businessStatus?: 'OPEN' | 'OPEN_24H' | 'CLOSED' | 'CLOSED_TMP' | 'CLOSED_PERM'
	openingHours?: Array<OpeningHourType>
	website?: string
	phone: {
		short?: string
		long?: string
	}
}

/**
 * get place data from google map url
 */
const getPlaceData = async (url: string): Promise<FormattedPlaceDataType | boolean> => {
	// browser context
	const browser = await puppeteer.launch({
		headless: true,
	})

	// page setting
	const page = await browser.newPage()
	await page.setViewport({
		width: 1280,
		height: 720,
	})

	// open google map page
	await page.goto(url, {
		waitUntil: 'networkidle0',
	})

	// load selector
	await page.waitForSelector('#QA0Szd')

	// eval page code
	const placeData = await page.evaluate((url) => {
		// check elem
		const placeInfoPane = document.querySelector('#QA0Szd')
		if (placeInfoPane === null) {
			return false
		}

		// geometry
		const urlPrefix = 'https://www.google.com/maps/place/'
		const rawGeometry = url.replace(urlPrefix, '').split('/')[1]
		const [lat, lng, zoom] = rawGeometry.replace(/[@z]/gi, '').split(',')

		// name
		const nameElem = document.querySelector('.lMbq3e h1 span')
		const name = nameElem instanceof HTMLElement ? nameElem.innerHTML : undefined

		// desc
		const descElem = document.querySelector('.PYvSYb span')
		const desc = descElem instanceof HTMLElement ? descElem.innerHTML : undefined

		// address
		const globalAddressElem = document.querySelector('button[data-item-id="address"] .Io6YTe')
		const globalAddress =
			globalAddressElem instanceof HTMLElement ? globalAddressElem.innerHTML : undefined
		const addressElem = document.querySelector('button[data-item-id="laddress"] .Io6YTe')
		const address = addressElem instanceof HTMLElement ? addressElem.innerHTML : undefined

		// business status
		const statusCode: { [index: string]: string } = {
			'영업 중': 'OPEN',
			'24시간 영업': 'OPEN_24H',
			'금일 휴업': 'CLOSED',
			'임시 휴업': 'CLOSED_TMP',
			'폐업': 'CLOSED_PERM',
		}
		const businessStatusElem = document.querySelector('.ZDu9vd > span:nth-child(1) > span')
		const businessStatusText =
			businessStatusElem instanceof HTMLElement ? businessStatusElem.innerHTML : undefined
		const businessStatus =
			typeof businessStatusText !== 'undefined' ? statusCode[businessStatusText] : undefined

		// opening hours
		const openingHourTable = document.querySelector('.t39EBf.GUrTXd table')
		let openingHours = []
		if (openingHourTable !== null) {
			for (let i = 1; i <= 7; i++) {
				// get opening hour string
				const openingHourElem = document.querySelector(
					`.t39EBf.GUrTXd table > tbody > tr:nth-child(${i}) li`
				)
				const hourStr =
					openingHourElem instanceof HTMLElement ? openingHourElem.innerHTML : undefined

				// format time
				openingHours.push(hourStr)
			}
		}

		// website
		const websiteElem = document.querySelector('a[data-item-id="authority"] .Io6YTe')
		const website = websiteElem instanceof HTMLElement ? websiteElem.innerHTML : undefined

		// phone
		const formattedPhoneElem = document.querySelector('button[data-item-id*="phone:"] .Io6YTe')
		const formattedPhone =
			formattedPhoneElem instanceof HTMLElement ? formattedPhoneElem.innerHTML : undefined
		const phoneElem = document.querySelector('button[data-item-id*="phone:"]')
		const phone =
			phoneElem instanceof HTMLElement
				? phoneElem.dataset.itemId?.replace('phone:tel:', '')
				: undefined
		const phoneData = phone && formattedPhone ? { short: phone, long: formattedPhone } : undefined

		// return data
		return {
			geometry: {
				lat,
				lng,
				zoom,
			},
			name,
			desc,
			address: {
				global: globalAddress,
				long: address,
			},
			businessStatus,
			openingHours,
			website,
			phone: phoneData,
		}
	}, url)

	// check data
	if (!placeData) return false

	// close browser
	browser.close()

	// format openingHours data
	const formattedOpeningHours: Array<OpeningHourType> = []
	const { openingHours } = placeData as PlaceDataType
	if (typeof openingHours !== 'undefined') {
		for (const openingHour of openingHours) {
			formattedOpeningHours.push(formatOpeningHours(openingHour))
		}
	}

	// return place data
	return {
		...(placeData as PlaceDataType),
		openingHours: formattedOpeningHours,
	}
}

export {
	getPlaceId,
	getPlaceInfo,
	getPlaceData,
	PlaceIdType,
	PlaceInfoType,
	FormattedPlaceDataType,
}
