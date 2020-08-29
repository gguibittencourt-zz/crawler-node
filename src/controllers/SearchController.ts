import { Request, Response } from 'express'
import puppeteer, { Page, Browser, ElementHandle } from 'puppeteer'
import { Room } from '@interfaces/Room'

class SearchController {
  private static readonly STRING_DATE_REGEX: RegExp = new RegExp('^(\\d{2})\\/(\\d{2})\\/(\\d{4})$')
  private static readonly URL: string = 'https://myreservations.omnibees.com'
  private static readonly SEARCH_URL: string = SearchController.URL + '/default.aspx?q=5462#/&diff=false&CheckIn={0}&CheckOut={1}&Code=&group_code=&loyality_card=&NRooms=1&ad=1&ch=0&ag=-'
  private static readonly DESCRIPTION_SELECTOR: string = '#popupModule .roomDescription'

  public async search (req: Request, res: Response): Promise<any> {
    const { checkin, checkout } = req.body

    const error = SearchController.validate(checkin, checkout)
    if (error) {
      return res.status(422).json({ error: error })
    }

    try {
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1100,
          height: 600
        }
      })
      const page: Page = await browser.newPage()
      await page.goto(SearchController.getSearchUrl(checkin, checkout))
      await page.waitForSelector('#results', { visible: true })

      const rooms: Room[] = await SearchController.getRooms(page, browser)
      await browser.close()
      return res.json(rooms)
    } catch (error) {
      return res.status(500).json({ error: error })
    }
  }

  private static async getRooms (page: Page, browser: Browser): Promise<Room[]> {
    const rooms: Room[] = await page.$$eval('#results .roomExcerpt', async (elements: Element[]) => {
      return elements.map((element: Element) => {
        const room: Room = { description: '', images: [], name: '', price: '' }
        room.price = element.querySelector('.bestPriceTextColor .sincePriceContent h6').textContent
        room.name = element.querySelector('.excerpt h5').textContent
        room.images = Array.from(element.querySelectorAll('.roomSlider .slide a')).map((image: Element) => {
          return 'https://myreservations.omnibees.com' + image.getAttribute('href')
        })
        return room
      })
    })
    await SearchController.getDescriptions(rooms, page, browser)
    return rooms
  }

  private static async getDescriptions (rooms: Room[], page: Page, browser: Browser): Promise<void> {
    const descriptionLinks: string[] = await page.$$eval(
      '.roomExcerpt div.excerpt p a',
      (descriptions: Element[]) => descriptions.map((description: Element) => description.getAttribute('href'))
    )
    for (const descriptionLink of descriptionLinks) {
      const index: number = descriptionLinks.indexOf(descriptionLink)
      const descriptionPage: Page = await browser.newPage()
      await descriptionPage.goto(SearchController.URL + descriptionLink)
      await descriptionPage.waitForSelector(SearchController.DESCRIPTION_SELECTOR, { visible: true })
      rooms[index].description = await descriptionPage.$eval(SearchController.DESCRIPTION_SELECTOR, description => description.textContent.replace('\nDescrição\n\n\n', ''))
      await descriptionPage.close()
    }
  }

  private static validate (checkin: any, checkout: any): string {
    if (!checkin || !checkout) {
      return 'Checkin and checkout parameters are required'
    }
    if (!SearchController.STRING_DATE_REGEX.test(checkin) || !SearchController.STRING_DATE_REGEX.test(checkout)) {
      return 'Checkin and checkout parameters must be in DD/MM/yyyy format'
    }
    const checkinDate: Date = SearchController.dateFormatter(checkin)
    const checkoutDate: Date = SearchController.dateFormatter(checkout)
    if (checkinDate > checkoutDate) {
      return 'The checkin parameter must be less than the checkout'
    }
    return ''
  }

  private static getSearchUrl (checkin: string, checkout: string): string {
    const checkinFormatted: string = SearchController.dateStringFormatter(checkin)
    const checkoutFormatted: string = SearchController.dateStringFormatter(checkout)
    const newUrl: string = SearchController.SEARCH_URL.replace('{0}', checkinFormatted)
    return newUrl.replace('{1}', checkoutFormatted)
  }

  private static dateFormatter (dateString: string): Date {
    const [day, month, year] = dateString.split('/')
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  private static dateStringFormatter (dateString: string): string {
    return dateString.split('/').join('')
  }
}

export default new SearchController()
