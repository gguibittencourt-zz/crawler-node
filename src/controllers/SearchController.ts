import { Request, Response } from 'express'
import puppeteer from 'puppeteer'

class SearchController {
  private static readonly STRING_DATE_REGEX: RegExp = new RegExp('^(\\d{2})\\/(\\d{2})\\/(\\d{4})$');
  private static readonly URL: string = 'https://myreservations.omnibees.com/default.aspx?q=5462#/&diff=false&CheckIn={0}&CheckOut={1}&Code=&group_code=&loyality_card=&NRooms=1&ad=1&ch=0&ag=-'

  public async search (req: Request, res: Response): Promise<any> {
    const checkin: string = SearchController.formatterDate(req.body.checkin)
    const checkout: string = SearchController.formatterDate(req.body.checkout)
    const url: string = SearchController.formatterUrl(checkin, checkout)

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    const result = await page.evaluate(() => {
      const prices = []
      document.querySelectorAll('h6')
        .forEach((book) => {
          console.log(book)
          prices.push(book.textContent)
        })
      return prices
    })
    await browser.close()
    return res.json(result)
  }

  private static formatterUrl (checkin: string, checkout: string): string {
    const newUrl: string = SearchController.URL.replace('{0}', checkin)
    return newUrl.replace('{1}', checkout)
  }

  private static formatterDate (dateString: string): string {
    // TODO validar data invalida e lancar erro
    if (!dateString || !SearchController.STRING_DATE_REGEX.test(dateString)) {
      return null
    }
    return dateString.replace('/', '')
  }
}

export default new SearchController()
