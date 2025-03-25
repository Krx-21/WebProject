'use client'

import DateReserve from "@/components/DateReserve";
import FormControl from "@mui/material/FormControl";
import { Menu, TextField } from "@mui/material";
import {Select, MenuItem} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

export default function Booking () {
    return (
        <main>
            <FormControl>
                <TextField variant='standard' name='Name-Lastname' label='Name-Lastname'/>
                <TextField variant='standard' name='Contact-Number' label='Contact-Number'/>
                <TextField variant='standard' name='Drivers-License' label='Drivers License Number'/>
                <Select id='provider' variant='standard' name='provider'>
                    <MenuItem value='Premium'>Premium Cars</MenuItem>
                    <MenuItem value='Budget'>Budget Rentals</MenuItem>
                    <MenuItem value='Luxury'>Luxury Auto Rental</MenuItem>
                </Select>
                <Select id='car-type' variant='standard' name='car-type'>
                    <MenuItem value='sedan'>Sedan</MenuItem>
                    <MenuItem value='suv'>SUV</MenuItem>
                    <MenuItem value='luxury'>Luxury</MenuItem>
                </Select>
                <DateReserve/>
                <button className='black rounded-md bg-sky-600 hover:indigo-600' name='Reserve Car'>
                    Reserve Car
                </button>
            </FormControl>
        </main>
    );
}