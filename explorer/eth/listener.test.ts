import rethinkdb from 'rethinkdb-mock'
import main from './listener'

describe('Ethereum blockchain grabber', () => {
  it('should insert event from web3 contract to rethinkdb correctly', async () => {
    const db = rethinkdb({ name: 'ethereum' })
    db.init({
      contractCalls: [
        { id: 3, blockNumber: 3 },
        { id: 2, blockNumber: 2 },
      ]
    })
    const ctr: any = {
      events: {
        allEvents: jest.fn()
      }
    }
    
    await main(db, db, ctr)

    expect(ctr.events.allEvents).toHaveBeenCalledTimes(1)
    const cb = ctr.events.allEvents.mock.calls[0][1]

    await cb(null, { id: 4, blockNumber: 4 })

    expect(db._tables.contractCalls).toHaveLength(3)
    expect(db._tables.contractCalls[2]).toEqual({ id: 4, blockNumber: 4 })
  })
})