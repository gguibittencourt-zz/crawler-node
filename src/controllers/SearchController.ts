import { Request, Response } from 'express'
import puppeteer, { Page, Browser, ElementHandle } from 'puppeteer'
import { Room } from '@interfaces/Room'

class SearchController {
  private static readonly STRING_DATE_REGEX: RegExp = new RegExp('^(\\d{2})\\/(\\d{2})\\/(\\d{4})$')
  private static readonly SEARCH_PATH: string = 'https://myreservations.omnibees.com/default.aspx?q=5462#/&diff=false&CheckIn={0}&CheckOut={1}&Code=&group_code=&loyality_card=&NRooms=1&ad=1&ch=0&ag=-'

  public async search (req: Request, res: Response): Promise<any> {
    // TODO VALIDAR CHECKIN < CHECKOUT
    const checkin: string = SearchController.dateStringFormatter(req.body.checkin)
    const checkout: string = SearchController.dateStringFormatter(req.body.checkout)
    const url: string = SearchController.urlFormatter(checkin, checkout)

    const browser: Browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 1100,
        height: 600
      }
    })

    await page.waitForFunction('!!document.querySelector("#popupModule .roomDescription")')
    await page.waitForSelector('#popupModule .roomDescription')

    const rooms: Room[] = await page.$$eval('#results .roomExcerpt', async (elements: Element[]) => {
      return elements.map((element: Element) => {
        const room: Room = { description: '', images: [], name: '', price: '' }
        room.name = element.querySelector('.excerpt h5').textContent
        room.price = element.querySelector('.sincePriceContent h6').textContent
        room.images = []
        element.querySelectorAll('.roomSlider .slide a').forEach((image: Element) => {
          room.images.push('https://myreservations.omnibees.com' + image.getAttribute('href'))
        })
        return room
      })
    })

    const page: Page = await browser.newPage()
    await Promise.all([
      page.goto(url),
      page.waitForSelector('#results', {
        visible: true
      })
    ])

    const descriptions: ElementHandle[] = await page.$$('.roomExcerpt div.excerpt p a')
    descriptions.map(async (description: ElementHandle) => {
      await Promise.all([
        description.focus(),
        description.click(),
        page.waitFor(50000)
      ])
    })

    await browser.close()
    return res.json(rooms)
  }

  private static urlFormatter (checkin: string, checkout: string): string {
    const newUrl: string = SearchController.SEARCH_PATH.replace('{0}', checkin)
    return newUrl.replace('{1}', checkout)
  }

  private static dateStringFormatter (dateString: string): string {
    // TODO validar data invalida e lancar erro
    if (!dateString || !SearchController.STRING_DATE_REGEX.test(dateString)) {
      return null
    }
    return dateString.split('/').join('')
  }
}

export default new SearchController()
